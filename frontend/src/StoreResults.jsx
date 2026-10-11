import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";

const green = {
  deep: "#263b2f",
  leaf: "#698574",
  muted: "#607367",
  border: "#e5eae3",
  paper: "rgba(255, 255, 255, 0.92)",
};

function formatDistance(distance) {
  return `${Number(distance).toFixed(2)} miles`;
}

function getWebsiteUrl(website) {
  if (typeof website !== "string") {
    return null;
  }

  try {
    const url = new URL(website);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}

export default function StoreResults({ stores, address, radius }) {
  if (stores.length === 0) {
    return (
      <Card
        elevation={0}
        sx={{
          border: `1px solid ${green.border}`,
          borderRadius: "16px",
          backgroundColor: green.paper,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography sx={{ color: green.deep, fontWeight: 700 }}>
            No grocery stores found within {radius}{" "}
            {radius === 1 ? "mile" : "miles"}.
          </Typography>
          <Typography sx={{ mt: 0.7, color: "#758179", fontSize: 13 }}>
            Try a larger search radius or a nearby address.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "flex-end" }}
        justifyContent="space-between"
        spacing={1}
      >
        <Box>
          <Typography
            component="h2"
            sx={{
              color: green.deep,
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: "-0.04em",
            }}
          >
            Grocery stores near you
          </Typography>
          <Typography sx={{ mt: 0.5, color: "#758179", fontSize: 13 }}>
            {stores.length} {stores.length === 1 ? "store" : "stores"} within{" "}
            {radius} {radius === 1 ? "mile" : "miles"} of {address}
          </Typography>
        </Box>
        <Chip
          label="LIVE RESULTS"
          size="small"
          sx={{
            border: "1px solid #dce8d9",
            backgroundColor: "#eff5ed",
            color: green.muted,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.08em",
          }}
        />
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: stores.length > 1 ? "repeat(2, minmax(0, 1fr))" : "1fr",
          },
          gap: 2,
        }}
      >
        {stores.map((store, index) => {
          const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`;
          const websiteUrl = getWebsiteUrl(store.website);

          return (
            <Card
              key={`${store.name}-${store.address}-${index}`}
              elevation={0}
              sx={{
                border: `1px solid ${green.border}`,
                borderRadius: "15px",
                backgroundColor: green.paper,
                boxShadow: "0 12px 34px rgba(31, 49, 37, 0.045)",
              }}
            >
              <CardContent sx={{ p: { xs: 2.2, sm: 2.7 } }}>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Box
                    sx={{
                      display: "grid",
                      width: 42,
                      height: 42,
                      flex: "0 0 auto",
                      placeItems: "center",
                      borderRadius: "12px",
                      backgroundColor: "#eff5ed",
                      color: green.leaf,
                    }}
                  >
                    <StorefrontRoundedIcon />
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      sx={{
                        color: green.deep,
                        fontSize: 16,
                        fontWeight: 700,
                        lineHeight: 1.4,
                      }}
                    >
                      {store.name}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={0.5}
                      alignItems="flex-start"
                      sx={{ mt: 0.8 }}
                    >
                      <LocationOnOutlinedIcon
                        sx={{
                          mt: "1px",
                          color: "#89978d",
                          fontSize: 16,
                        }}
                      />
                      <Typography
                        sx={{
                          color: "#69766e",
                          fontSize: 12,
                          lineHeight: 1.6,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {store.address}
                      </Typography>
                    </Stack>
                    <Chip
                      label={formatDistance(store.distance)}
                      size="small"
                      sx={{
                        mt: 1.3,
                        height: 25,
                        backgroundColor: "#f3f6f1",
                        color: green.muted,
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    />
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      sx={{ mt: 1.8 }}
                    >
                      <Button
                        component="a"
                        href={directionsUrl}
                        target="_blank"
                        rel="noreferrer"
                        variant="outlined"
                        size="small"
                        endIcon={<ArrowOutwardRoundedIcon />}
                        sx={{
                          borderColor: "#d7e2d7",
                          borderRadius: "8px",
                          color: green.deep,
                          textTransform: "none",
                          "&:hover": {
                            borderColor: green.leaf,
                            backgroundColor: "#f5f8f3",
                          },
                        }}
                      >
                        Directions
                      </Button>
                      {websiteUrl && (
                        <Button
                          component="a"
                          href={websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          variant="text"
                          size="small"
                          endIcon={<ArrowOutwardRoundedIcon />}
                          sx={{
                            borderRadius: "8px",
                            color: green.leaf,
                            textTransform: "none",
                          }}
                        >
                          Store website
                        </Button>
                      )}
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Box>
      <Typography
        sx={{
          color: "#929c94",
          fontSize: 11,
          lineHeight: 1.6,
          textAlign: "center",
        }}
      >
        Store information and websites are provided by the backend search and
        may change. Distances are measured from your entered address.
      </Typography>
    </Stack>
  );
}
