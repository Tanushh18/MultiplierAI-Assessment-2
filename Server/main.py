from fastapi import FastAPI, Depends, Query
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
from auth import hash_password, verify_password
import requests
import urllib.parse
import os
import time
import re
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from bs4 import BeautifulSoup
import trafilatura
from playwright.sync_api import sync_playwright
import undetected_chromedriver as uc

# Load env
load_dotenv()

# DB setup
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# ---------------- CORS ---------------- #
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# PREVIEW FUNCTION
# =========================================================

import base64

def generate_preview(url: str):
    print(f"\n[PREVIEW] Taking screenshot of: {url}")
    driver = None

    try:
        options = uc.ChromeOptions()

        # ❗ IMPORTANT: headless OFF for Justdial
        options.add_argument("--start-maximized")
        options.add_argument("--disable-blink-features=AutomationControlled")

        driver = uc.Chrome(
    options=options,
    version_main=146   # 👈 MATCH YOUR CHROME VERSION
)

        # Step 1: Build trust (referrer chain)
        driver.get("https://www.google.com")
        time.sleep(2)

        # Step 2: Open target
        driver.get(url)

        # Step 3: Wait properly (not just sleep)
        time.sleep(5)

        # Step 4: Human-like scrolling
        for i in range(5):
            driver.execute_script("window.scrollBy(0, 1200)")
            time.sleep(1)
            driver.execute_script("window.scrollTo(0, 0)")
            time.sleep(2)
            screenshot = driver.get_screenshot_as_base64()
            
        # Step 5: Ensure body loaded
        body = driver.find_element("tag name", "body")

        # Step 6: Screenshot
        screenshot = driver.get_screenshot_as_base64()

        print("  ✅ SCREENSHOT SUCCESS (browser)")
        return f"data:image/png;base64,{screenshot}"

    except Exception as e:
        print(f"  ❌ BROWSER SCREENSHOT FAILED: {e}")

    finally:
        if driver:
            try:
                driver.quit()
            except:
                pass

    # =====================================================
    # FALLBACK → Screenshot API (NOW ACTUALLY RUNS)
    # =====================================================

    try:
        print("  → Trying Screenshot API fallback...")

        API_KEY = os.getenv("SCREENSHOT_API_KEY")
        encoded_url = urllib.parse.quote(url, safe="")

        api_url = (
            f"https://shot.screenshotapi.net/screenshot"
            f"?token={API_KEY}&url={encoded_url}"
            f"&width=1200&height=800&full_page=true"
        )

        res = requests.get(api_url, timeout=20)
        data = res.json()

        if data.get("screenshot"):
            print("  ✅ SCREENSHOT SUCCESS (API)")
            return data["screenshot"]

    except Exception as e:
        print(f"  ❌ API FALLBACK FAILED: {e}")

    return None
# =========================================================
# DB CONNECTION
# =========================================================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================================================
# AUTH
# =========================================================

@app.post("/signup")
def signup(username: str, password: str, db: Session = Depends(get_db)):
    user = models.User(
        username=username,
        password=hash_password(password)
    )
    db.add(user)
    db.commit()
    return {"message": "User created"}


@app.post("/login")
def login(username: str, password: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user or not verify_password(password, user.password):
        return {"error": "Invalid credentials"}
    return {"user_id": user.id}


# =========================================================
# LINKS
# =========================================================
@app.post("/add-link")
def add_link(user_id: int, url: str, db: Session = Depends(get_db)):
    preview = generate_preview(url)

    if not preview:
        print("⚠️ Preview generation failed")

    link = models.Link(url=url, preview=preview, user_id=user_id)
    db.add(link)
    db.commit()

    return {
        "message": "Saved",
        "preview_generated": preview is not None
    }

@app.get("/links/{user_id}")
def get_links(user_id: int, db: Session = Depends(get_db)):
    return db.query(models.Link).filter(models.Link.user_id == user_id).all()


# =========================================================
# SCRAPER — STEP 1: STATIC (TRAFILATURA)
# =========================================================

def extract_static(url: str):
    print("\n[1/4] Trying STATIC (trafilatura)...")
    try:
        downloaded = trafilatura.fetch_url(url)
        text = trafilatura.extract(downloaded)
        if text and len(text.strip()) > 500:
            print("  ✅ STATIC SUCCESS")
            return text, "trafilatura"
        else:
            print(f"  ❌ STATIC FAILED — text too short or empty: {len(text.strip()) if text else 0} chars")
    except Exception as e:
        print(f"  ❌ STATIC EXCEPTION: {e}")
    return None, None


# =========================================================
# SCRAPER — STEP 2: REQUESTS + SESSION HEADERS
# =========================================================

def extract_requests(url: str):
    print("\n[2/4] Trying REQUESTS + SESSION HEADERS...")
    session = requests.Session()
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xhtml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-IN,en;q=0.9,hi;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Referer": "https://www.google.com/",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "cross-site",
        "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
    }
    try:
        base_url = "/".join(url.split("/")[:3])
        print(f"  → Step 1: Hitting homepage {base_url} for cookies...")
        homepage_res = session.get(base_url, headers=headers, timeout=15)
        print(f"  → Homepage status: {homepage_res.status_code}")

        print(f"  → Step 2: Hitting target URL...")
        response = session.get(url, headers=headers, timeout=15)
        print(f"  → Target status: {response.status_code}")

        if response.status_code == 200:
            soup = BeautifulSoup(response.text, "html.parser")
            for tag in soup(["script", "style", "noscript"]):
                tag.decompose()
            text = "\n".join([t.strip() for t in soup.stripped_strings if t.strip()])
            if text and len(text.strip()) > 200:
                print(f"  ✅ REQUESTS SUCCESS — {len(text)} chars")
                return text, "requests_session"
            else:
                print(f"  ❌ REQUESTS FAILED — response too short: {len(text.strip())} chars")
        else:
            print(f"  ❌ REQUESTS FAILED — HTTP {response.status_code}")
    except Exception as e:
        print(f"  ❌ REQUESTS EXCEPTION: {e}")
    return None, None


# =========================================================
# SCRAPER — STEP 3: DYNAMIC (PLAYWRIGHT)
# =========================================================

def extract_dynamic(url: str):
    print("\n[3/4] Trying PLAYWRIGHT...")
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()

            print(f"  → Navigating to {url}...")
            page.goto(url, wait_until="networkidle", timeout=60000)
            print("  → Page loaded, scrolling...")

            for _ in range(6):
                page.mouse.wheel(0, 3000)
                page.wait_for_timeout(1000)

            button_texts = []
            for b in page.query_selector_all("button"):
                try:
                    txt = b.inner_text().strip()
                    if txt:
                        button_texts.append(txt)
                except:
                    pass

            html = page.content()
            browser.close()

        soup = BeautifulSoup(html, "html.parser")
        for tag in soup(["script", "style", "noscript"]):
            tag.decompose()

        page_text = "\n".join([t.strip() for t in soup.stripped_strings if t.strip()])
        ui_text = "\n".join(["[BUTTON] " + t for t in button_texts])
        final_text = page_text + "\n\n" + ui_text

        if final_text.strip():
            print(f"  ✅ PLAYWRIGHT SUCCESS — {len(final_text)} chars")
            return final_text, "playwright"
        else:
            print("  ❌ PLAYWRIGHT FAILED — empty content")
    except Exception as e:
        print(f"  ❌ PLAYWRIGHT EXCEPTION: {e}")
    return None, None


# =========================================================
# SCRAPER — STEP 4: UNDETECTED CHROME (NO HEADLESS)
# =========================================================
def extract_undetected(url: str):
    print("\n[4/4] Trying UNDETECTED CHROME (real browser, no headless)...")
    driver = None

    try:
        import undetected_chromedriver as uc

        options = uc.ChromeOptions()

        # ✅ Stable options (important)
        options.add_argument("--window-size=1920,1080")
        options.add_argument("--disable-blink-features=AutomationControlled")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")

        # ✅ FIX: match your Chrome version (146)
        driver = uc.Chrome(
            options=options,
            version_main=146
        )

        print("  → Opening Google first (referrer chain)...")
        driver.get("https://www.google.com")
        time.sleep(2)

        print(f"  → Navigating to {url}...")
        driver.get(url)
        time.sleep(5)

        print("  → Scrolling to load content...")
        for i in range(5):
            driver.execute_script("window.scrollBy(0, 1500)")
            time.sleep(1.2)
            print(f"  → Scroll {i+1}/5")

        html = driver.page_source

        driver.quit()
        driver = None

        from bs4 import BeautifulSoup
        soup = BeautifulSoup(html, "html.parser")

        for tag in soup(["script", "style", "noscript"]):
            tag.decompose()

        text = "\n".join([t.strip() for t in soup.stripped_strings if t.strip()])

        if text and len(text.strip()) > 200:
            print(f"  ✅ UNDETECTED CHROME SUCCESS — {len(text)} chars")
            return text, "undetected_chrome"
        else:
            print(f"  ❌ UNDETECTED CHROME FAILED — text too short: {len(text.strip())} chars")

    except Exception as e:
        print(f"  ❌ UNDETECTED CHROME EXCEPTION: {e}")

    finally:
        if driver:
            try:
                driver.quit()
            except:
                pass

    return None,

# =========================================================
# CORE SELECTOR — CHAINED FALLBACK SYSTEM
# =========================================================

def get_full_text(url: str):
    print("\n" + "="*60)
    print(f"[SCRAPER] Starting extraction for: {url}")
    print("="*60)

    # ✅ FINAL FIX FOR JUSTDIAL
    if "justdial.com" in url:
        print("\n[SCRAPER] ⚠️ JustDial detected → skipping scraping, using screenshot only")

        preview = generate_preview(url)

        return preview, "screenshot_only"

    # Normal flow for other websites
    text, method = extract_static(url)
    if text:
        return text, method

    text, method = extract_requests(url)
    if text:
        return text, method

    text, method = extract_dynamic(url)
    if text:
        return text, method

    return None, None

# =========================================================
# JUSTDIAL PARSER — Extract structured fields from raw text
# =========================================================

def parse_justdial_doctor(text: str) -> dict:
    data = {
        "name": None,
        "hospital": None,
        "specialization": None,
        "qualifications": [],
        "registration": None,
        "address": None,
        "city": None,
        "pincode": None,
        "payment_modes": [],
        "rating": None,
        "category": None,
    }

    lines = [l.strip() for l in text.split("\n") if l.strip()]

    for i, line in enumerate(lines):

        # Name — "Dr." prefix, grab before parenthesis
        if "Dr." in line and data["name"] is None:
            data["name"] = line.split("(")[0].strip()

        # Hospital — inside parentheses after doctor name
        if "Dr." in line and "(" in line and ")" in line and data["hospital"] is None:
            match = re.search(r'\((.+?)\)', line)
            if match:
                data["hospital"] = match.group(1).strip()

        # Category (e.g. Cardiologists)
        if line in ["Cardiologists", "Dermatologists", "Dentists", "Gynaecologists",
                    "Orthopaedic Doctors", "General Physician Doctors", "Neurologists",
                    "Paediatricians", "Psychiatrists", "Urologist Doctors"] and data["category"] is None:
            data["category"] = line

        # Specialization — line after "Specialization" label
        if line == "Specialization" and i + 1 < len(lines):
            data["specialization"] = lines[i + 1]

        # Registration — line after "Registration" label
        if line == "Registration" and i + 1 < len(lines):
            data["registration"] = lines[i + 1]

        # Qualifications — lines starting with known degree prefixes
        if re.match(r'^(MBBS|MD|DM|MS|BDS|MDS|BHMS|BAMS|DNB|FRCS|MCh|MPH)', line):
            if line not in data["qualifications"]:
                data["qualifications"].append(line)

        # Address — long line containing a 6-digit pincode
        if re.search(r'\d{6}', line) and len(line) > 40 and data["address"] is None:
            data["address"] = line
            pin = re.search(r'\d{6}', line)
            if pin:
                data["pincode"] = pin.group()
            city_match = re.search(r'(\w+)-\d{6}', line)
            if city_match:
                data["city"] = city_match.group(1)

        # Payment modes
        if line in ["Cash", "Card", "Online", "UPI", "Cheque", "Net Banking"]:
            if line not in data["payment_modes"]:
                data["payment_modes"].append(line)

        # Rating — standalone decimal number
        if re.match(r'^\d+\.\d+$', line):
            data["rating"] = float(line)

    return data


# =========================================================
# ROUTES
# =========================================================

@app.get("/extract")
def extract(url: str = Query(...)):
    data, method = get_full_text(url)

    return {
        "url": url,
        "preview": data if method == "screenshot_only" else None,
        "text": data if method != "screenshot_only" else None,
        "method": method,
        "success": data is not None
    }

@app.get("/extract-clean")
def extract_clean(url: str = Query(...)):
    text, method = get_full_text(url)

    if not text:
        return {"url": url, "title": None, "text": None, "method": method, "success": False}

    cleaned = "\n".join([line.strip() for line in text.split("\n") if line.strip()])

    title = None
    try:
        res = requests.get(url, timeout=10, headers={"User-Agent": "Mozilla/5.0"})
        soup = BeautifulSoup(res.text, "html.parser")
        title = soup.title.string if soup.title else None
    except:
        pass

    return {
        "url": url,
        "title": title,
        "text": cleaned,
        "method": method,
        "success": True,
        "length": len(cleaned)
    }


@app.get("/extract-structured")
def extract_structured(url: str = Query(...)):
    text, method = get_full_text(url)

    if not text:
        return {"url": url, "paragraphs": [], "method": method, "success": False}

    paragraphs = [p.strip() for p in text.split("\n") if len(p.strip()) > 40]
    return {
        "url": url,
        "paragraphs": paragraphs,
        "method": method,
        "success": True,
        "count": len(paragraphs)
    }


@app.get("/extract-justdial")
def extract_justdial(url: str = Query(...)):
    text, method = get_full_text(url)

    if not text:
        return {
            "success": False,
            "url": url,
            "error": "Failed to extract page — all 4 methods failed",
            "data": None
        }

    structured = parse_justdial_doctor(text)

    return {
        "success": True,
        "url": url,
        "method": method,
        "data": structured,
        "raw_length": len(text)
    }