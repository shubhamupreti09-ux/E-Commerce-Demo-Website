/**
 * Initialize mock data.
 * Force reset of localStorage to inject 100+ items
 */

const resetVersion = 'v3-100-items';
if (localStorage.getItem('demo_data_version') !== resetVersion) {
    localStorage.removeItem('ecommerce_products'); // clear old
    localStorage.setItem('demo_data_version', resetVersion);
}

document.addEventListener('DOMContentLoaded', () => {
    if (Store.getProducts().length === 0) {
        
        const generatedProducts = [];
        let idCounter = 1;

        // Base premium items
        const premiumItems = [
            { name: 'Ultra-Wide Curved Monitor', price: 799.99, category: 'electronics', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=2070&auto=format&fit=crop', stock: 3, description: 'Experience true immersion with this 34-inch 144Hz monitor.', isFeatured: true },
            { name: 'Premium Cotton T-Shirt', price: 29.99, category: 'clothing', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2080&auto=format&fit=crop', stock: 45, description: 'A breathable, stylish premium cotton t-shirt for everyday wear.', isFeatured: true },
            { name: 'Smart Home Hub Controller', price: 129.99, category: 'electrical', image: 'https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=2070&auto=format&fit=crop', stock: 25, description: 'Control your entire home ecosystem from a single smart plug hub.', isFeatured: true },
            { name: 'Organic Fresh Produce Box', price: 34.00, category: 'grocery', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop', stock: 50, description: 'A curated selection of fresh organic vegetables and fruits sourced directly from local farms.', isFeatured: true }
        ];

        premiumItems.forEach(item => {
            generatedProducts.push({
                id: `p${idCounter++}`,
                ...item
            });
        });

        // Generators for the remaining ~96 items
        const clothingAdjectives = ['Vintage', 'Modern', 'Slim-Fit', 'Oversized', 'Casual', 'Formal', 'Athletic', 'Cozy'];
        const clothingNouns = ['Jeans', 'Hoodie', 'Sneakers', 'Jacket', 'Sweater', 'Chinos', 'Polo Shirt', 'Shorts'];
        const clothingImages = [
            'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&q=80',
            'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80',
            'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&q=80',
            'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&q=80'
        ];

        const electronicsAdjectives = ['Wireless', 'Bluetooth', 'Noise-Cancelling', 'Portable', 'Smart', 'Gaming', '4K', 'Pro'];
        const electronicsNouns = ['Headphones', 'Earbuds', 'Mouse', 'Keyboard', 'Webcam', 'Microphone', 'Tablet', 'Speaker'];
        const electronicsImages = [
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
            'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80',
            'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&q=80',
            'https://images.unsplash.com/photo-1606220838315-056192d5e927?w=500&q=80'
        ];

        const electricalAdjectives = ['Heavy-Duty', 'Industrial', 'LED', 'Energy-Saving', 'Smart', 'Magnetic', 'Rechargeable'];
        const electricalNouns = ['Power Strip', 'Extension Cord', 'Light Bulb', 'Ceiling Fan', 'Wall Switch', 'Multimeter', 'Drill'];
        const electricalImages = [
            'https://images.unsplash.com/photo-1558002038-1055907df827?w=500&q=80',
            'https://images.unsplash.com/photo-1596489392263-d1cbeab82c16?w=500&q=80',
            'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=500&q=80',
            'https://images.unsplash.com/photo-1544724569-5f546fd6f2b6?w=500&q=80'
        ];

        const groceryAdjectives = ['Organic', 'Gluten-Free', 'Vegan', 'Fresh', 'Premium', 'Artisan', 'Spicy', 'Sweet'];
        const groceryNouns = ['Coffee Beans', 'Tea Pack', 'Almond Milk', 'Dark Chocolate', 'Pasta', 'Olive Oil', 'Honey', 'Hot Sauce'];
        const groceryImages = [
            'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=500&q=80',
            'https://images.unsplash.com/photo-1587049352847-8d4c0b4bc902?w=500&q=80',
            'https://images.unsplash.com/photo-1600856209923-34372e319a5d?w=500&q=80',
            'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&q=80'
        ];

        const generateRandomItems = (adjs, nouns, images, category, count) => {
            const items = [];
            for (let i = 0; i < count; i++) {
                const adj = adjs[Math.floor(Math.random() * adjs.length)];
                const noun = nouns[Math.floor(Math.random() * nouns.length)];
                const img = images[Math.floor(Math.random() * images.length)];
                const price = (Math.random() * 100 + 10).toFixed(2);
                const stock = Math.floor(Math.random() * 200);
                
                items.push({
                    name: `${adj} ${noun} ${i + 1}`,
                    price: parseFloat(price),
                    category: category,
                    image: img,
                    stock: stock,
                    description: `High-quality ${adj.toLowerCase()} ${noun.toLowerCase()} perfect for your needs.`,
                    isFeatured: false
                });
            }
            return items;
        };

        // Generate 24 of each category to reach ~100 total
        const generatedClothing = generateRandomItems(clothingAdjectives, clothingNouns, clothingImages, 'clothing', 24);
        const generatedElectronics = generateRandomItems(electronicsAdjectives, electronicsNouns, electronicsImages, 'electronics', 24);
        const generatedElectrical = generateRandomItems(electricalAdjectives, electricalNouns, electricalImages, 'electrical', 24);
        const generatedGrocery = generateRandomItems(groceryAdjectives, groceryNouns, groceryImages, 'grocery', 24);

        const allExtras = [...generatedClothing, ...generatedElectronics, ...generatedElectrical, ...generatedGrocery];
        
        // Shuffle the extras so they appear mixed in the shop
        allExtras.sort(() => Math.random() - 0.5);

        allExtras.forEach(item => {
            generatedProducts.push({
                id: `p${idCounter++}`,
                ...item
            });
        });

        Store.setProducts(generatedProducts);
    }
});
