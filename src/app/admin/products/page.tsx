"use client";

import React, { useEffect, useState } from "react";
import ProductTable from "../../../components/admin/products/ProductTable";
import { useGetAllProductsQuery } from "../../../redux/features/productApi";

const ProductsPage = () => {
    // Destructure the response
    const { data, error, isLoading } = useGetAllProductsQuery({});
    const [processedProducts, setProcessedProducts] = useState([]);

    console.log("Products data:", data); // Log the products data for debugging
    console.log("Products error:", error); // Log the error for debugging
    console.log("Products loading:", isLoading); // Log the loading state for debugging

    useEffect(() => {
        if (data && Array.isArray(data.data)) {
            const formattedProducts = data.data.map((product) => {
                return {
                    id: product._id, // Accessing the product's _id
                    name: product.title, // Accessing the product's title
                    sku: product.sku,
                    price: product.price,
                    category: product.category.name, // Assuming category is nested and has a name
                    status: product.status,
                    inventory: product.quantity,
                    vendor: null, // Assuming vendor is not provided in the API response
                    sales_channel: null, // Assuming this is not available in the response
                    created_at: product.createdAt, // Assuming createdAt exists
                    updated_at: product.updatedAt,
                    tags: product.tags.join(", "), // Joining tags into a single string
                };
            });

            // Set the processed products state
            setProcessedProducts(formattedProducts);
        }
    }, [data]);

    // Handle loading state
    if (isLoading) return <div>Loading...</div>;

    // Handle error state
    if (error) return <div>Error fetching products</div>;

    return (
        <div className="container mx-auto py-6">
            {/* Pass the processed data to ProductTable */}
            <ProductTable products={processedProducts} />
        </div>
    );
};

export default ProductsPage;
