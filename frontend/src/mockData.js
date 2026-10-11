export const initialGroceries = [
    { id: 1, name: "Milk", quantity: 1, unit: "gallon" },
    { id: 2, name: "Eggs", quantity: 1, unit: "dozen" },
    { id: 3, name: "Bananas", quantity: 2, unit: "lb" },
    { id: 4, name: "Bread", quantity: 1, unit: "count" },
];
const storeFixtures = [
    {
        id: "value-basket",
        name: "Value Basket",
        location: "Union Square, New York",
        distance: 0.8,
        multiplier: 0.9,
        unavailable: [],
        searchUrl: "https://www.walmart.com/search?q=",
    },
    {
        id: "green-market",
        name: "Green Market",
        location: "Chelsea, New York",
        distance: 1.4,
        multiplier: 1,
        unavailable: ["blueberries", "raspberries"],
        searchUrl: "https://www.target.com/s?searchTerm=",
    },
    {
        id: "neighborhood-grocer",
        name: "Neighborhood Grocer",
        location: "Flatiron, New York",
        distance: 2.1,
        multiplier: 0.96,
        unavailable: ["raspberries"],
        searchUrl: "https://www.instacart.com/store/s?k=",
    },
];
const basePrices = {
    milk: 4.29,
    eggs: 5.49,
    bananas: 0.79,
    bread: 3.79,
    apples: 1.99,
    rice: 2.49,
    chicken: 6.99,
    "olive oil": 8.99,
    blueberries: 4.49,
    raspberries: 4.99,
};
function estimatePrice(item, store) {
    const name = item.name.trim().toLowerCase();
    const matchingName = Object.keys(basePrices).find((product) => name === product || name.includes(product));
    const basePrice = matchingName === undefined
        ? 3.5 + ((name.length * 7) % 20) / 10
        : basePrices[matchingName];
    const quantityMultiplier = item.unit === "oz" ? item.quantity / 16 : item.quantity;
    return Number((basePrice * quantityMultiplier * store.multiplier).toFixed(2));
}
export function createMockComparisons(groceries, radius) {
    return storeFixtures
        .filter((store) => store.distance <= radius)
        .map((store) => {
        const products = groceries.map((item) => {
            const unavailable = store.unavailable.some((product) => item.name.toLowerCase().includes(product));
            return {
                itemId: item.id,
                itemName: item.name,
                quantity: item.quantity,
                unit: item.unit,
                price: unavailable ? null : estimatePrice(item, store),
                sourceUrl: `${store.searchUrl}${encodeURIComponent(item.name)}`,
            };
        });
        const missingItems = products
            .filter((product) => product.price === null)
            .map((product) => product.itemName);
        const total = products.reduce((sum, product) => sum + (product.price ?? 0), 0);
        return {
            id: store.id,
            name: store.name,
            location: store.location,
            distance: store.distance,
            total: Number(total.toFixed(2)),
            missingItems,
            products,
        };
    })
        .sort((first, second) => first.total - second.total);
}
export function getCheapestCompleteBasket(comparisons) {
    return comparisons
        .filter((store) => store.missingItems.length === 0)
        .sort((first, second) => first.total - second.total)[0];
}
export function formatPrice(value) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(value);
}
