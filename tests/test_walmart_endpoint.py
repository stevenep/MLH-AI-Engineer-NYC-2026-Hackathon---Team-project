import os
import unittest
from unittest.mock import patch

import app as flask_app


class WalmartPricesEndpointTests(unittest.TestCase):
    def setUp(self):
        self.client = flask_app.app.test_client()

    @patch.dict(os.environ, {"NIMBLE_API_KEY": "test-key"})
    @patch("app.search_walmart_grocery_list")
    @patch("app.extract_walmart_products")
    @patch("app.Nimble")
    def test_returns_walmart_results_for_items_and_zipcode(
        self,
        nimble_mock,
        extract_products_mock,
        search_list_mock,
    ):
        raw_response = {"data": {"parsing": []}}
        search_list_mock.return_value = {
            "store": "Walmart",
            "zipcode": "10001",
            "results": {"milk": raw_response},
        }
        products = [
            {
                "product_name": "Whole Milk",
                "price": 3.49,
                "url": "https://www.walmart.com/ip/example",
            }
        ]
        extract_products_mock.return_value = products

        response = self.client.post(
            "/api/walmart-prices",
            json={"zipcode": "10001", "items": [" milk ", "milk"]},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.get_json(),
            {
                "store": "Walmart",
                "zipcode": "10001",
                "results": {
                    "milk": {"products": products, "error": None},
                },
            },
        )
        nimble_mock.assert_called_once_with(api_key="test-key")
        search_list_mock.assert_called_once_with(
            nimble_mock.return_value,
            ["milk"],
            "10001",
        )
        extract_products_mock.assert_called_once_with(raw_response)

    def test_rejects_invalid_zipcode(self):
        response = self.client.post(
            "/api/walmart-prices",
            json={"zipcode": "1000", "items": ["milk"]},
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.get_json()["error"],
            "ZIP code must contain 5 digits.",
        )

    def test_rejects_invalid_item_list(self):
        response = self.client.post(
            "/api/walmart-prices",
            json={"items": []},
        )

        self.assertEqual(response.status_code, 400)

    @patch.dict(os.environ, {}, clear=True)
    def test_reports_missing_api_key(self):
        response = self.client.post(
            "/api/walmart-prices",
            json={"items": ["milk"]},
        )

        self.assertEqual(response.status_code, 500)
        self.assertIn("API key is missing", response.get_json()["error"])

    @patch.dict(os.environ, {"NIMBLE_API_KEY": "test-key"})
    @patch("app.search_walmart_grocery_list")
    @patch("app.Nimble")
    def test_reports_walmart_search_failure(
        self, _nimble_mock, search_list_mock
    ):
        search_list_mock.side_effect = RuntimeError("provider down")

        response = self.client.post(
            "/api/walmart-prices",
            json={"items": ["milk"]},
        )

        self.assertEqual(response.status_code, 502)
        self.assertEqual(
            response.get_json()["error"],
            "Walmart price lookup failed.",
        )


if __name__ == "__main__":
    unittest.main()
