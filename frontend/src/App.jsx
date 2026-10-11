import { useEffect, useRef, useState } from "react";
import { Alert, AppBar, Box, Button, Card, CardContent, Chip, CircularProgress, createTheme, Divider, FormControl, IconButton, InputAdornment, MenuItem, Paper, Select, Stack, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField, ThemeProvider, Toolbar, Typography, } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import LocalGroceryStoreRoundedIcon from "@mui/icons-material/LocalGroceryStoreRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import ShoppingBasketRoundedIcon from "@mui/icons-material/ShoppingBasketRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import { createMockComparisons, formatPrice, getCheapestCompleteBasket, initialGroceries, } from "./mockData";
const green = {
    deep: "#263b2f",
    hover: "#385643",
    leaf: "#698574",
    muted: "#607367",
    border: "#e5eae3",
    paper: "rgba(255, 255, 255, 0.92)",
};
const theme = createTheme({
    palette: {
        primary: { main: green.deep },
        background: { default: "#f3f5f1" },
    },
    typography: {
        fontFamily: '"DM Sans", sans-serif',
        button: { textTransform: "none", fontWeight: 600 },
    },
});
const units = ["count", "dozen", "gallon", "lb", "oz"];
function BrandMark({ compact = false }) {
    return (<Box sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.1,
            minWidth: 0,
        }}>
      <Box sx={{
            display: "grid",
            width: 38,
            height: 38,
            flex: "0 0 auto",
            placeItems: "center",
            borderRadius: "12px",
            background: "linear-gradient(145deg, #385643, #263b2f)",
            color: "white",
        }}>
        <ShoppingBasketRoundedIcon fontSize="small"/>
      </Box>
      {!compact && (<Typography sx={{
                overflow: "hidden",
                color: green.deep,
                fontSize: { xs: 14, sm: 16 },
                fontWeight: 700,
                letterSpacing: "-0.045em",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
            }}>
          BroceryBasketAIFriend
        </Typography>)}
    </Box>);
}
function HomeDashboard({ onStartShopping }) {
    return (<Stack spacing={{ xs: 3, md: 3.5 }}>
      <Paper elevation={0} sx={{
            position: "relative",
            overflow: "hidden",
            p: { xs: 3, sm: 5, md: 6 },
            border: `1px solid ${green.border}`,
            borderRadius: "22px",
            background: "radial-gradient(ellipse at 88% 0%, rgba(211, 229, 214, 0.7), transparent 38%), linear-gradient(135deg, #ffffff 0%, #f5f8f3 100%)",
            boxShadow: "0 24px 80px rgba(31, 49, 37, 0.07)",
        }}>
        <Box sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.25fr 0.75fr" },
            alignItems: "center",
            gap: { xs: 4, md: 6 },
        }}>
          <Stack alignItems="flex-start" spacing={2.5}>
            <Chip icon={<AutoAwesomeRoundedIcon />} label="YOUR SMARTER GROCERY SIDEKICK" size="small" sx={{
            height: 30,
            border: "1px solid #e2ebe1",
            backgroundColor: "#f5f8f3",
            color: green.muted,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.09em",
            "& .MuiChip-icon": { color: green.leaf, fontSize: 16 },
        }}/>
            <Typography component="h1" sx={{
            maxWidth: 650,
            color: "#17231f",
            fontSize: { xs: 42, sm: 54, md: 66 },
            fontWeight: 600,
            letterSpacing: "-0.065em",
            lineHeight: 1.04,
        }}>
              Your groceries.
              <br />
              <Box component="span" sx={{ color: green.leaf }}>
                Less expensive.
              </Box>
            </Typography>
            <Typography sx={{
            maxWidth: 475,
            color: "#69766e",
            fontSize: { xs: 15, sm: 17 },
            lineHeight: 1.75,
        }}>
              Compare your grocery basket across nearby stores and find the
              prices that leave a little more in your pocket.
            </Typography>
            <Button variant="contained" size="large" endIcon={<ArrowForwardRoundedIcon />} onClick={onStartShopping} sx={{
            minHeight: 50,
            mt: 0.5,
            px: 2.5,
            borderRadius: "9px",
            backgroundColor: green.deep,
            fontWeight: 600,
            "&:hover": { backgroundColor: green.hover },
        }}>
              Start Shopping
            </Button>
          </Stack>

          <Box sx={{
            position: "relative",
            minHeight: { xs: 210, md: 300 },
            display: "grid",
            placeItems: "center",
            border: "1px solid rgba(221, 232, 220, 0.9)",
            borderRadius: "18px",
            background: "radial-gradient(circle at 50% 42%, #e5efe3 0%, #f5f8f3 61%, rgba(255,255,255,0.55) 100%)",
        }}>
            <Box sx={{
            display: "grid",
            width: { xs: 108, md: 132 },
            height: { xs: 108, md: 132 },
            placeItems: "center",
            borderRadius: "36px",
            background: "linear-gradient(145deg, #789480, #47664f)",
            boxShadow: "0 22px 46px rgba(49, 80, 57, 0.2)",
            color: "white",
            transform: "rotate(-7deg)",
        }}>
              <LocalGroceryStoreRoundedIcon sx={{ fontSize: 62 }}/>
            </Box>
            <Paper elevation={0} sx={{
            position: "absolute",
            right: { xs: 12, md: 18 },
            bottom: { xs: 16, md: 24 },
            p: 1.6,
            border: `1px solid ${green.border}`,
            borderRadius: "12px",
            backgroundColor: green.paper,
            boxShadow: "0 12px 30px rgba(31, 49, 37, 0.08)",
        }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <SavingsRoundedIcon sx={{ color: green.leaf }}/>
                <Box>
                  <Typography sx={{ color: "#829087", fontSize: 10 }}>
                    BASKET SAVINGS
                  </Typography>
                  <Typography sx={{ color: green.deep, fontSize: 18, fontWeight: 700 }}>
                    Find your best price
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Box>
        </Box>
      </Paper>

      <Box sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            gap: 2,
        }}>
        {[
            {
                icon: <ShoppingBasketRoundedIcon />,
                title: "Build your basket",
                body: "Add the groceries you actually need, in the quantities you buy.",
            },
            {
                icon: <StorefrontRoundedIcon />,
                title: "Compare nearby stores",
                body: "See item-by-item prices and which shops have your whole list.",
            },
            {
                icon: <SavingsRoundedIcon />,
                title: "Keep more in your pocket",
                body: "Spot the lowest complete basket and see your possible savings.",
            },
        ].map((feature) => (<Card key={feature.title} elevation={0} sx={{
                border: `1px solid ${green.border}`,
                borderRadius: "15px",
                backgroundColor: green.paper,
                boxShadow: "0 12px 36px rgba(31, 49, 37, 0.04)",
            }}>
            <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
              <Box sx={{
                display: "grid",
                width: 38,
                height: 38,
                mb: 1.6,
                placeItems: "center",
                borderRadius: "11px",
                backgroundColor: "#eff5ed",
                color: green.leaf,
            }}>
                {feature.icon}
              </Box>
              <Typography sx={{ color: green.deep, fontSize: 15, fontWeight: 700 }}>
                {feature.title}
              </Typography>
              <Typography sx={{
                mt: 0.8,
                color: "#758179",
                fontSize: 13,
                lineHeight: 1.65,
            }}>
                {feature.body}
              </Typography>
            </CardContent>
          </Card>))}
      </Box>
    </Stack>);
}
function GroceryListPage() {
    const [groceries, setGroceries] = useState(initialGroceries);
    const nextItemId = useRef(5);
    const [newName, setNewName] = useState("");
    const [newQuantity, setNewQuantity] = useState(1);
    const [newUnit, setNewUnit] = useState("count");
    const [zipCode, setZipCode] = useState("10001");
    const [radius, setRadius] = useState(3);
    const [budget, setBudget] = useState("");
    const [comparisons, setComparisons] = useState(null);
    const [status, setStatus] = useState("idle");
    const comparisonTimeout = useRef(undefined);
    useEffect(() => () => {
        if (comparisonTimeout.current !== undefined) {
            window.clearTimeout(comparisonTimeout.current);
        }
    }, []);
    function updateGroceries(nextGroceries) {
        if (comparisonTimeout.current !== undefined) {
            window.clearTimeout(comparisonTimeout.current);
            comparisonTimeout.current = undefined;
        }
        setGroceries(nextGroceries);
        setComparisons(null);
        setStatus("idle");
    }
    function addGrocery(event) {
        event.preventDefault();
        const name = newName.trim();
        if (!name || !Number.isFinite(newQuantity) || newQuantity <= 0) {
            return;
        }
        updateGroceries([
            ...groceries,
            {
                id: nextItemId.current++,
                name,
                quantity: newQuantity,
                unit: newUnit,
            },
        ]);
        setNewName("");
        setNewQuantity(1);
        setNewUnit("count");
    }
    function updateItem(id, updates) {
        updateGroceries(groceries.map((item) => (item.id === id ? { ...item, ...updates } : item)));
    }
    function handleRadiusChange(event) {
        if (comparisonTimeout.current !== undefined) {
            window.clearTimeout(comparisonTimeout.current);
            comparisonTimeout.current = undefined;
        }
        setRadius(Number(event.target.value));
        setComparisons(null);
        setStatus("idle");
    }
    function comparePrices() {
        if (groceries.length === 0 ||
            groceries.some((item) => !item.name.trim() || item.quantity <= 0)) {
            return;
        }
        if (comparisonTimeout.current !== undefined) {
            window.clearTimeout(comparisonTimeout.current);
        }
        setComparisons(null);
        setStatus("loading");
        const grocerySnapshot = groceries.map((item) => ({ ...item }));
        const radiusSnapshot = radius;
        comparisonTimeout.current = window.setTimeout(() => {
            setComparisons(createMockComparisons(grocerySnapshot, radiusSnapshot));
            setStatus("success");
        }, 550);
    }
    const cheapest = comparisons
        ? getCheapestCompleteBasket(comparisons)
        : undefined;
    const mostExpensiveComplete = comparisons
        ?.filter((store) => store.missingItems.length === 0)
        .reduce((highest, store) => !highest || store.total > highest.total ? store : highest, undefined);
    const savings = cheapest && mostExpensiveComplete
        ? Number((mostExpensiveComplete.total - cheapest.total).toFixed(2))
        : 0;
    const canCompare = groceries.length > 0 &&
        groceries.every((item) => item.name.trim() && item.quantity > 0);
    return (<Stack spacing={3}>
      <Box>
        <Chip icon={<AutoAwesomeRoundedIcon />} label="YOUR AI GROCERY ASSISTANT" size="small" sx={{
            mb: 1.3,
            backgroundColor: "#edf4eb",
            color: green.muted,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.09em",
            "& .MuiChip-icon": { color: green.leaf },
        }}/>
        <Typography component="h1" sx={{
            color: "#17231f",
            fontSize: { xs: 33, sm: 42 },
            fontWeight: 600,
            letterSpacing: "-0.055em",
            lineHeight: 1.15,
        }}>
          Let&apos;s find your best basket.
        </Typography>
        <Typography sx={{ mt: 1, color: "#69766e", fontSize: 15 }}>
          Add your groceries and compare the demo prices at stores near you.
        </Typography>
      </Box>

      <Card elevation={0} sx={{
            overflow: "visible",
            border: `1px solid ${green.border}`,
            borderRadius: "18px",
            backgroundColor: green.paper,
            boxShadow: "0 18px 54px rgba(31, 49, 37, 0.055)",
        }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 }, "&:last-child": { pb: 3 } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Box>
              <Typography sx={{ color: green.deep, fontSize: 18, fontWeight: 700 }}>
                Your grocery list
              </Typography>
              <Typography sx={{ mt: 0.4, color: "#829087", fontSize: 12 }}>
                Add an item, then adjust its quantity and unit.
              </Typography>
            </Box>
            <Chip label={`${groceries.length} ${groceries.length === 1 ? "item" : "items"}`} size="small" sx={{
            backgroundColor: "#eff5ed",
            color: green.muted,
            fontWeight: 600,
        }}/>
          </Stack>

          <Stack component="form" onSubmit={addGrocery} direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ mt: 2.5, mb: 2 }}>
            <TextField value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="e.g. Avocados" label="Add grocery item" size="small" fullWidth required/>
            <TextField value={newQuantity} onChange={(event) => setNewQuantity(Number(event.target.value) || 0)} label="Qty" size="small" type="number" inputProps={{ min: 0.1, step: 0.1 }} sx={{ width: { xs: "100%", sm: 105 } }} required/>
            <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 130 } }}>
              <Select value={newUnit} onChange={(event) => setNewUnit(event.target.value)} aria-label="New item unit" IconComponent={ExpandMoreRoundedIcon}>
                {units.map((unit) => (<MenuItem key={unit} value={unit}>
                    {unit}
                  </MenuItem>))}
              </Select>
            </FormControl>
            <Button type="submit" variant="outlined" startIcon={<AddRoundedIcon />} sx={{
            minWidth: { xs: "100%", sm: 112 },
            whiteSpace: "nowrap",
            borderColor: "#d7e2d7",
            borderRadius: "8px",
            color: green.deep,
            fontWeight: 600,
            textTransform: "none",
            "&:hover": {
                borderColor: green.leaf,
                backgroundColor: "#f5f8f3",
            },
        }}>
              Add item
            </Button>
          </Stack>

          {groceries.length === 0 ? (<Paper variant="outlined" sx={{
                p: 3,
                borderStyle: "dashed",
                borderColor: "#dce5dc",
                borderRadius: "11px",
                backgroundColor: "#fbfcfa",
                textAlign: "center",
            }}>
              <Typography sx={{ color: "#758179", fontSize: 13 }}>
                Your list is empty. Add a grocery item to get started.
              </Typography>
            </Paper>) : (<Stack spacing={1}>
              {groceries.map((item) => (<Paper key={item.id} variant="outlined" sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "minmax(0, 1fr) 56px 94px 40px",
                        sm: "minmax(0, 1fr) 86px 116px 40px",
                    },
                    alignItems: "center",
                    gap: { xs: 0.8, sm: 1.2 },
                    p: 1.2,
                    borderColor: "#edf0eb",
                    borderRadius: "10px",
                    backgroundColor: "#fbfcfa",
                }}>
                  <TextField value={item.name} onChange={(event) => updateItem(item.id, { name: event.target.value })} size="small" variant="standard" inputProps={{
                    "aria-label": `Grocery item ${item.name}`,
                }} InputProps={{
                    disableUnderline: true,
                    startAdornment: (<InputAdornment position="start">
                          <EditRoundedIcon sx={{ color: "#9aa79d", fontSize: 16 }}/>
                        </InputAdornment>),
                }} sx={{
                    minWidth: 0,
                    "& .MuiInputBase-input": {
                        color: green.deep,
                        fontSize: 14,
                        fontWeight: 600,
                    },
                }}/>
                  <TextField value={item.quantity} onChange={(event) => updateItem(item.id, {
                    quantity: Number(event.target.value) || 0,
                })} size="small" type="number" inputProps={{
                    min: 0.1,
                    step: 0.1,
                    "aria-label": `Quantity for ${item.name}`,
                }} sx={{
                    "& .MuiOutlinedInput-root": {
                        borderRadius: "7px",
                        backgroundColor: "white",
                    },
                }}/>
                  <FormControl size="small">
                    <Select value={item.unit} onChange={(event) => updateItem(item.id, {
                    unit: event.target.value,
                })} inputProps={{ "aria-label": `Unit for ${item.name}` }} IconComponent={ExpandMoreRoundedIcon} sx={{
                    borderRadius: "7px",
                    backgroundColor: "white",
                    fontSize: 12,
                }}>
                      {units.map((unit) => (<MenuItem key={unit} value={unit}>
                          {unit}
                        </MenuItem>))}
                    </Select>
                  </FormControl>
                  <IconButton aria-label={`Remove ${item.name}`} onClick={() => updateGroceries(groceries.filter((grocery) => grocery.id !== item.id))} size="small" sx={{
                    color: "#8c9990",
                    "&:hover": {
                        backgroundColor: "#faece9",
                        color: "#a64f44",
                    },
                }}>
                    <DeleteOutlineRoundedIcon fontSize="small"/>
                  </IconButton>
                </Paper>))}
            </Stack>)}

          <Divider sx={{ my: 2.6, borderColor: "#edf0eb" }}/>

          <Box sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            gap: 1.5,
        }}>
            <TextField value={zipCode} onChange={(event) => setZipCode(event.target.value.replace(/\D/g, "").slice(0, 5))} label="ZIP code" size="small" inputProps={{ inputMode: "numeric", maxLength: 5 }} InputProps={{
            startAdornment: (<InputAdornment position="start">
                    <LocationOnOutlinedIcon sx={{ color: "#839188", fontSize: 18 }}/>
                  </InputAdornment>),
        }}/>
            <FormControl size="small">
              <Select value={radius} onChange={handleRadiusChange} aria-label="Search radius" startAdornment={<InputAdornment position="start">
                    <LocationOnOutlinedIcon sx={{ color: "#839188", fontSize: 17 }}/>
                  </InputAdornment>} IconComponent={ExpandMoreRoundedIcon} sx={{ borderRadius: "8px" }}>
                {[1, 3, 5, 10].map((miles) => (<MenuItem key={miles} value={miles}>
                    Within {miles} {miles === 1 ? "mile" : "miles"}
                  </MenuItem>))}
              </Select>
            </FormControl>
            <TextField value={budget} onChange={(event) => setBudget(event.target.value.replace(/[^\d.]/g, ""))} label="Grocery budget (optional)" size="small" type="number" inputProps={{ min: 0, step: 0.01 }} InputProps={{
            startAdornment: (<InputAdornment position="start">$</InputAdornment>),
        }}/>
          </Box>

          <Button fullWidth variant="contained" size="large" startIcon={status === "loading" ? (<CircularProgress size={17} color="inherit"/>) : (<SavingsRoundedIcon />)} onClick={comparePrices} disabled={!canCompare || status === "loading"} sx={{
            minHeight: 52,
            mt: 2.2,
            borderRadius: "9px",
            backgroundColor: green.deep,
            fontSize: 14,
            fontWeight: 700,
            "&:hover": { backgroundColor: green.hover },
            "&.Mui-disabled": {
                backgroundColor: "#aab8ad",
                color: "white",
            },
        }}>
            {status === "loading"
            ? "Comparing demo prices…"
            : "Find Cheapest Groceries"}
          </Button>
          <Typography sx={{ mt: 1.1, color: "#8b968f", fontSize: 11, textAlign: "center" }}>
            Demo comparison only · Sample prices are not live store prices
          </Typography>
        </CardContent>
      </Card>

      {status === "loading" && (<Paper elevation={0} sx={{
                display: "flex",
                minHeight: 140,
                alignItems: "center",
                justifyContent: "center",
                gap: 1.5,
                border: `1px solid ${green.border}`,
                borderRadius: "16px",
                backgroundColor: green.paper,
                color: green.muted,
            }}>
          <CircularProgress size={22} sx={{ color: green.leaf }}/>
          <Typography sx={{ fontSize: 14 }}>
            Comparing your basket at nearby demo stores…
          </Typography>
        </Paper>)}

      {status === "success" && comparisons && (<Stack spacing={2}>
          <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "flex-end" }} justifyContent="space-between" spacing={1}>
            <Box>
              <Typography component="h2" sx={{
                color: green.deep,
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: "-0.04em",
            }}>
                Your price comparison
              </Typography>
              <Typography sx={{ mt: 0.45, color: "#758179", fontSize: 13 }}>
                {comparisons.length} demo{" "}
                {comparisons.length === 1 ? "store" : "stores"} near {zipCode}
                {" · "}within {radius} {radius === 1 ? "mile" : "miles"}
              </Typography>
            </Box>
            <Chip label="DEMO DATA" size="small" sx={{
                border: "1px solid #dce8d9",
                backgroundColor: "#eff5ed",
                color: green.muted,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.08em",
            }}/>
          </Stack>

          {comparisons.length === 0 ? (<Alert severity="info" sx={{
                    border: `1px solid ${green.border}`,
                    borderRadius: "12px",
                    backgroundColor: green.paper,
                    color: green.muted,
                }}>
              No demo stores were found within {radius}{" "}
              {radius === 1 ? "mile" : "miles"}. Try expanding your search
              radius.
            </Alert>) : (<>
              {cheapest ? (<Paper elevation={0} sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr auto" },
                        alignItems: "center",
                        gap: 2,
                        p: { xs: 2.2, sm: 2.8 },
                        border: "1px solid #d9e8d8",
                        borderRadius: "15px",
                        background: "linear-gradient(120deg, #edf5eb, rgba(255,255,255,0.93))",
                    }}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <CheckCircleRoundedIcon sx={{ color: "#548460", fontSize: 30 }}/>
                    <Box>
                      <Typography sx={{
                        color: "#577b5e",
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.09em",
                    }}>
                        CHEAPEST COMPLETE BASKET
                      </Typography>
                      <Typography sx={{
                        mt: 0.3,
                        color: green.deep,
                        fontSize: 19,
                        fontWeight: 700,
                    }}>
                        {cheapest.name}
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={2.5} sx={{ pl: { xs: 5.5, sm: 0 } }}>
                    <Box>
                      <Typography sx={{ color: "#829087", fontSize: 10 }}>
                        BASKET TOTAL
                      </Typography>
                      <Typography sx={{
                        color: green.deep,
                        fontSize: 22,
                        fontWeight: 700,
                    }}>
                        {formatPrice(cheapest.total)}
                      </Typography>
                    </Box>
                    {savings > 0 && (<Chip icon={<SavingsRoundedIcon />} label={`Save ${formatPrice(savings)}`} size="small" sx={{
                            backgroundColor: "#dcebd9",
                            color: "#426b4a",
                            fontWeight: 700,
                            "& .MuiChip-icon": { color: "#548460" },
                        }}/>)}
                  </Stack>
                </Paper>) : (<Alert severity="warning" sx={{
                        border: `1px solid ${green.border}`,
                        borderRadius: "12px",
                        backgroundColor: green.paper,
                    }}>
                  No nearby demo store has every item in your list. Review
                  missing items below or expand your search radius.
                </Alert>)}

              <Box sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        md: comparisons.length > 1
                            ? "repeat(2, minmax(0, 1fr))"
                            : "minmax(0, 1fr)",
                    },
                    gap: 2,
                }}>
                {comparisons.map((store) => {
                    const isCheapest = store.id === cheapest?.id;
                    return (<Card key={store.id} elevation={0} sx={{
                            border: isCheapest
                                ? "1px solid #bcd5bd"
                                : `1px solid ${green.border}`,
                            borderRadius: "15px",
                            backgroundColor: green.paper,
                            boxShadow: isCheapest
                                ? "0 14px 38px rgba(70, 112, 75, 0.09)"
                                : "0 12px 34px rgba(31, 49, 37, 0.04)",
                        }}>
                      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, "&:last-child": { pb: 2.5 } }}>
                        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
                          <Box sx={{ minWidth: 0 }}>
                            <Stack direction="row" alignItems="center" spacing={0.8}>
                              <StorefrontRoundedIcon sx={{ color: green.leaf, fontSize: 18 }}/>
                              <Typography sx={{
                            overflow: "hidden",
                            color: green.deep,
                            fontSize: 16,
                            fontWeight: 700,
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}>
                                {store.name}
                              </Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.8 }}>
                              <LocationOnOutlinedIcon sx={{ color: "#8d9990", fontSize: 15 }}/>
                              <Typography sx={{ color: "#829087", fontSize: 11 }}>
                                {store.location}
                              </Typography>
                              <Typography sx={{ color: "#a1aaa3", fontSize: 11 }}>
                                · {store.distance} mi
                              </Typography>
                            </Stack>
                          </Box>
                          <Box sx={{ flex: "0 0 auto", textAlign: "right" }}>
                            <Typography sx={{
                            color: "#829087",
                            fontSize: 9,
                            fontWeight: 600,
                            letterSpacing: "0.06em",
                        }}>
                              {store.missingItems.length > 0
                            ? "PARTIAL SUBTOTAL"
                            : "BASKET TOTAL"}
                            </Typography>
                            <Typography sx={{
                            color: green.deep,
                            fontSize: 18,
                            fontWeight: 700,
                        }}>
                              {formatPrice(store.total)}
                            </Typography>
                          </Box>
                        </Stack>

                        {isCheapest && (<Chip icon={<CheckCircleRoundedIcon />} label="Cheapest complete basket" size="small" sx={{
                                mt: 1.4,
                                backgroundColor: "#edf5eb",
                                color: "#507759",
                                fontSize: 10,
                                fontWeight: 600,
                                "& .MuiChip-icon": {
                                    color: "#548460",
                                    fontSize: 16,
                                },
                            }}/>)}

                        <TableContainer sx={{
                            mt: 1.8,
                            border: "1px solid #edf0eb",
                            borderRadius: "9px",
                        }}>
                          <Table size="small" aria-label={`${store.name} demo grocery prices`} sx={{ minWidth: 315 }}>
                            <TableHead>
                              <TableRow sx={{
                            backgroundColor: "#f7f9f6",
                            "& th": {
                                color: "#849087",
                                fontSize: 10,
                                fontWeight: 600,
                            },
                        }}>
                                <TableCell>ITEM</TableCell>
                                <TableCell>QTY</TableCell>
                                <TableCell align="right">PRICE</TableCell>
                                <TableCell sx={{ width: 34 }}/>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                            {store.products.map((product) => (<TableRow key={product.itemId}>
                                <TableCell sx={{ color: "#536158", fontSize: 11 }}>
                                  {product.itemName}
                                </TableCell>
                                <TableCell sx={{ color: "#536158", fontSize: 11 }}>
                                  {product.quantity} {product.unit}
                                </TableCell>
                                <TableCell align="right" sx={{
                                color: product.price === null
                                    ? "#a64f44"
                                    : green.deep,
                                fontSize: 11,
                                fontWeight: 600,
                            }}>
                                  {product.price === null
                                ? "Not in stock"
                                : formatPrice(product.price)}
                                </TableCell>
                                <TableCell align="center">
                                  <Box component="a" href={product.sourceUrl} target="_blank" rel="noreferrer" aria-label={`Open ${product.itemName} source at ${store.name}`} title="View example product search" sx={{
                                color: green.leaf,
                                fontSize: 12,
                                textDecoration: "none",
                                "&:hover": { textDecoration: "underline" },
                            }}>
                                      ↗
                                    </Box>
                                  </TableCell>
                                </TableRow>))}
                              </TableBody>
                            </Table>
                          </TableContainer>

                        {store.missingItems.length > 0 && (<Alert severity="warning" icon={false} sx={{
                                mt: 1.3,
                                borderRadius: "8px",
                                backgroundColor: "#fbf5e9",
                                color: "#85692c",
                                fontSize: 11,
                                "& .MuiAlert-message": { p: 0 },
                            }}>
                            Missing: {store.missingItems.join(", ")}
                          </Alert>)}
                      </CardContent>
                    </Card>);
                })}
              </Box>

              {budget && Number(budget) > 0 && cheapest && (<Alert severity={cheapest.total <= Number(budget) ? "success" : "warning"} sx={{
                        borderRadius: "11px",
                        backgroundColor: cheapest.total <= Number(budget) ? "#eff6ed" : "#fbf5e9",
                    }}>
                  {cheapest.total <= Number(budget)
                        ? `Great news — the cheapest complete basket is ${formatPrice(Number(budget) - cheapest.total)} under your ${formatPrice(Number(budget))} budget.`
                        : `The cheapest complete basket is ${formatPrice(cheapest.total - Number(budget))} over your ${formatPrice(Number(budget))} budget.`}
                </Alert>)}

              <Typography sx={{
                    color: "#929c94",
                    fontSize: 11,
                    lineHeight: 1.6,
                    textAlign: "center",
                }}>
                Demo data for illustration only. Prices and availability are
                estimates and may not match your local store. Product links open
                example retailer searches.
              </Typography>
            </>)}
        </Stack>)}
    </Stack>);
}
export default function App() {
    const [activeTab, setActiveTab] = useState("home");
    return (<ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", pb: { xs: 4, sm: 6 } }}>
      <AppBar position="sticky" elevation={0} sx={{
            borderBottom: "1px solid rgba(229, 234, 227, 0.9)",
            backgroundColor: "rgba(255, 255, 255, 0.88)",
            backdropFilter: "blur(16px)",
            color: green.deep,
        }}>
        <Toolbar disableGutters sx={{
            width: "min(100% - 36px, 1120px)",
            minHeight: "72px !important",
            mx: "auto",
            justifyContent: "space-between",
            gap: 2,
        }}>
          <BrandMark />
          <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} aria-label="Main navigation" sx={{
            minHeight: 46,
            "& .MuiTabs-indicator": {
                height: 2,
                borderRadius: 2,
                backgroundColor: green.leaf,
            },
            "& .MuiTab-root": {
                minWidth: { xs: 66, sm: 84 },
                minHeight: 46,
                px: 1.8,
                color: "#77847a",
                fontSize: 13,
                fontWeight: 600,
                textTransform: "none",
            },
            "& .Mui-selected": { color: `${green.deep} !important` },
        }}>
            <Tab value="home" label="Home"/>
            <Tab value="ai" label="AI"/>
          </Tabs>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{
            width: "min(100% - 36px, 1120px)",
            mx: "auto",
            pt: { xs: 3.5, sm: 5 },
        }}>
        <Box sx={{ display: activeTab === "home" ? "block" : "none" }}>
          <HomeDashboard onStartShopping={() => setActiveTab("ai")}/>
        </Box>
        <Box sx={{ display: activeTab === "ai" ? "block" : "none" }}>
          <GroceryListPage />
        </Box>
      </Box>
    </Box>
    </ThemeProvider>);
}
