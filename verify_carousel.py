from playwright.sync_api import sync_playwright

def verify_mobile_carousel():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a specific mobile device for emulation
        context = browser.new_context(**p.devices['iPhone 11'])
        page = context.new_page()

        # Mock the API response to ensure the carousel renders
        mock_products = [
            {"id": 1, "nome": "Air Max DN 'All Black'", "preco": 1099.99, "imagemUrl": "FRONT/inicio/IMG/airmax-dn-all-black.png", "marca": {"nome": "Nike"}, "categoria": {"nome": "Air Max DN"}},
            {"id": 2, "nome": "Air Max DN 'Pink'", "preco": 999.99, "imagemUrl": "FRONT/inicio/IMG/airmax-dn-pink.png", "marca": {"nome": "Nike"}, "categoria": {"nome": "Air Max DN"}},
            {"id": 3, "nome": "Air Max DN 'Another'", "preco": 1199.99, "imagemUrl": "FRONT/inicio/IMG/airmax-dn-all-black.png", "marca": {"nome": "Nike"}, "categoria": {"nome": "Air Max DN"}}
        ]

        page.route(
            "http://localhost:8080/api/produtos",
            lambda route: route.fulfill(status=200, json=mock_products)
        )

        page.goto("http://localhost:8000", wait_until="networkidle")

        # Take a screenshot of the entire page to see what's happening
        page.screenshot(path="verification.png")

        browser.close()

if __name__ == "__main__":
    verify_mobile_carousel()
