import os
import unittest
from unittest.mock import patch

import app as flask_app


class AldiPricesEndpointTests(unittest.TestCase):
    def setUp(self):
        self.client = flask_app.app.test_client()

    @patch.dict(os.environ, {"NIMBLE_API_KEY": "test-key"})
    @patch("app.find_aldi_prices")
    @patch("app.Nimble")
    def test_returns_aldi_prices_for_requested_items(
        self, nimble_mock, find_prices_mock
    ):
        expected = [
            {
                "requested_item": "milk",
                "products": [
                    {
                        "product_name": "Whole Milk",
                        "price": "3.49",
                        "currency": "USD",
                        "product_url": "https://www.aldi.us/product",
                    }
                ],
            }
        ]
        find_prices_mock.return_value = expected

        response = self.client.post(
            "/api/aldi-prices",
            json={"items": [" milk "]},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["aldi_items"], expected)
        nimble_mock.assert_called_once_with(api_key="test-key")
        find_prices_mock.assert_called_once_with(
            nimble_mock.return_value, ["milk"]
        )

    def test_rejects_empty_or_too_many_items(self):
        for items in ([], ["a", "b", "c", "d", "e", "f"]):
            with self.subTest(items=items):
                response = self.client.post(
                    "/api/aldi-prices",
                    json={"items": items},
                )
                self.assertEqual(response.status_code, 400)

    @patch.dict(os.environ, {}, clear=True)
    def test_reports_missing_api_key(self):
        response = self.client.post(
            "/api/aldi-prices",
            json={"items": ["milk"]},
        )

        self.assertEqual(response.status_code, 500)
        self.assertIn("API key is missing", response.get_json()["error"])

    @patch.dict(os.environ, {"NIMBLE_API_KEY": "test-key"})
    @patch("app.find_aldi_prices", side_effect=RuntimeError("provider down"))
    @patch("app.Nimble")
    def test_reports_provider_failure(self, _nimble_mock, _find_prices_mock):
        response = self.client.post(
            "/api/aldi-prices",
            json={"items": ["milk"]},
        )

        self.assertEqual(response.status_code, 502)
        self.assertEqual(
            response.get_json()["error"],
            "ALDI price lookup failed.",
        )


if __name__ == "__main__":
    unittest.main()
