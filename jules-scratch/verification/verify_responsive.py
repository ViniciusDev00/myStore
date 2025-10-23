import os
from playwright.sync_api import sync_playwright

def run(playwright):
    # Get the absolute path to the project directory
    project_root = os.path.abspath('.')

    # Launch the browser with web security disabled
    browser = playwright.chromium.launch(
        headless=True,
        args=["--disable-web-security"]
    )

    iphone_11 = playwright.devices['iPhone 11']
    context = browser.new_context(**iphone_11)
    page = context.new_page()

    # Add a listener for console messages to help with debugging
    page.on("console", lambda msg: print(f"Browser Console: {msg.text}"))

    # Verify Home Page
    home_url = f"file://{os.path.join(project_root, 'index.html')}"
    page.goto(home_url, wait_until='networkidle')
    page.screenshot(path="jules-scratch/verification/home_mobile.png")

    # Verify Catalog Page
    catalog_url = f"file://{os.path.join(project_root, 'FRONT/catalogo/HTML/catalogo.html')}"
    page.goto(catalog_url, wait_until='networkidle')

    try:
        # Wait for the product grid to be populated
        page.wait_for_selector('.product-card', timeout=15000)
        print("Verification successful: Product grid loaded.")
        page.screenshot(path="jules-scratch/verification/catalog_mobile.png")
    except Exception as e:
        print(f"Verification failed: {e}")
        # Take a screenshot of the error state for analysis
        page.screenshot(path="jules-scratch/verification/catalog_mobile_error.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)