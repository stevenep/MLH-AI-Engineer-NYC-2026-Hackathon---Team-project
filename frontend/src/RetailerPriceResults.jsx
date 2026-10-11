import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";

const green = {
  deep: "#263b2f",
  leaf: "#698574",
  muted: "#607367",
  border: "#e5eae3",
  paper: "rgba(255, 255, 255, 0.92)",
};

function getProductUrl(value, retailer) {
  if (typeof value !== "string") {
    return null;
  }

  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    const validHost = retailer.toLowerCase() === "walmart"
      ? hostname === "walmart.com" || hostname.endsWith(".walmart.com")
      : hostname === "aldi.us" || hostname.endsWith(".aldi.us");

    return url.protocol === "https:" && validHost ? url.href : null;
  } catch {
    return null;
  }
}

function displayPrice(value, currency = "USD") {
  if (value === null || value === undefined || value === "") {
    return "Price unavailable";
  }

  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return "Price unavailable";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export default function RetailerPriceResults({ retailer, results }) {
  if (results.length === 0) {
    return (
      <Alert
        severity="info"
        sx={{ border: `1px solid ${green.border}`, borderRadius: "12px" }}
      >
        {retailer} returned no product matches for this grocery list.
      </Alert>
    );
  }

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <StorefrontRoundedIcon sx={{ color: green.leaf }} />
        <Typography
          component="h2"
          sx={{
            color: green.deep,
            fontSize: 23,
            fontWeight: 700,
            letterSpacing: "-0.04em",
          }}
        >
          {retailer} product results
        </Typography>
        <Chip
          label="LIVE RESULTS"
          size="small"
          sx={{
            backgroundColor: "#eff5ed",
            color: green.muted,
            fontSize: 10,
            fontWeight: 700,
          }}
        />
      </Stack>

      <Typography sx={{ color: "#758179", fontSize: 12 }}>
        Prices are for the product package shown; grocery-list quantities are
        not multiplied into a basket total.
      </Typography>

      {results.map((result, index) => (
        <Card
          key={`${result.requested_item}-${index}`}
          elevation={0}
          sx={{
            border: `1px solid ${green.border}`,
            borderRadius: "15px",
            backgroundColor: green.paper,
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
            <Typography
              component="h3"
              sx={{ color: green.deep, fontSize: 15, fontWeight: 700 }}
            >
              Results for “{result.requested_item}”
            </Typography>

            {result.error ? (
              <Typography sx={{ mt: 1, color: "#a64f44", fontSize: 13 }}>
                Could not search this item: {result.error}
              </Typography>
            ) : result.products.length === 0 ? (
              <Typography sx={{ mt: 1, color: "#758179", fontSize: 13 }}>
                No matching product with a verified price was found.
              </Typography>
            ) : (
              <Stack spacing={1} sx={{ mt: 1.3 }}>
                {result.products.map((product, productIndex) => {
                  const productUrl = getProductUrl(
                    product.url || product.product_url,
                    retailer,
                  );
                  const isOutOfStock =
                    product.availability === "out_of_stock" ||
                    product.availability?.toLowerCase() === "out of stock" ||
                    product.out_of_stock === true;

                  return (
                    <Box
                      key={`${productUrl || product.product_name}-${productIndex}`}
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 2,
                        p: 1.4,
                        border: "1px solid #edf0eb",
                        borderRadius: "10px",
                        backgroundColor: "#fbfcfa",
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          sx={{
                            color: green.deep,
                            fontSize: 14,
                            fontWeight: 600,
                          }}
                        >
                          {product.product_name}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={0.7}
                          alignItems="center"
                          sx={{ mt: 0.6 }}
                        >
                          {isOutOfStock && (
                            <Chip
                              label="Out of stock"
                              size="small"
                              color="warning"
                              variant="outlined"
                            />
                          )}
                          {productUrl && (
                            <Link
                              href={productUrl}
                              target="_blank"
                              rel="noreferrer"
                              underline="hover"
                              sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 0.3,
                                color: green.leaf,
                                fontSize: 12,
                              }}
                            >
                              View at {retailer}
                              <ArrowOutwardRoundedIcon sx={{ fontSize: 14 }} />
                            </Link>
                          )}
                        </Stack>
                        {product.price_scope && (
                          <Typography
                            sx={{ mt: 0.6, color: "#8b968f", fontSize: 11 }}
                          >
                            {product.price_scope}
                          </Typography>
                        )}
                      </Box>
                      <Stack
                        direction="row"
                        spacing={0.7}
                        alignItems="center"
                        sx={{ flex: "0 0 auto" }}
                      >
                        <CheckCircleRoundedIcon
                          sx={{ color: green.leaf, fontSize: 17 }}
                        />
                        <Typography
                          sx={{
                            color: green.deep,
                            fontSize: 17,
                            fontWeight: 700,
                          }}
                        >
                          {displayPrice(product.price, product.currency)}
                        </Typography>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
