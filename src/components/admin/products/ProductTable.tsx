"use client";
import React, { useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../../../components/ui/table";
import { Button } from "../../../components/ui/button";
import { Select, SelectItem } from "../../../components/ui/select";
import { Checkbox } from "../../../components/ui/checkbox";
import { Input } from "../../../components/ui/input";

export interface Product { 
    id: string;
    name: string;
    status: string;
    inventory: string;
    sales_channel: string;
    category: string;
    vendor: string;
}

interface ProductTableProps {
    products: Product[];
}

const ProductTable: React.FC<ProductTableProps> = ({ products }) => {
    const [pageSize, setPageSize] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [filters, setFilters] = useState<{ [key: string]: string }>({});

    const handlePageSizeChange = (size: string) => {
        setPageSize(Number(size));
        setCurrentPage(1);
    };

    const handleSelectRow = (id: string) => {
        setSelectedRows((prev) =>
            prev.includes(id) ? prev.filter((row) => row !== id) : [...prev, id]
        );
    };

    const handleFilterChange = (field: string, value: string) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const filteredData = products?.filter((product) =>
        Object.entries(filters).every(([key, value]) => {
            const productValue = product[key] as unknown;
            return typeof productValue === "string" && productValue.toLowerCase().includes(value.toLowerCase());
        })
    );

    const paginatedData = filteredData?.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <div className="flex justify-between mb-4">
                <Select onValueChange={handlePageSizeChange} defaultValue={pageSize.toString()}>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                </Select>
                <Button onClick={() => console.log("Exporting", selectedRows)}>Export</Button>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableCell>
                            <Checkbox
                                onCheckedChange={(checked) =>
                                    setSelectedRows(checked ? products.map((p) => p.id) : [])
                                }
                            />
                        </TableCell>
                        {["name", "status", "inventory", "sales_channel", "category", "vendor"].map((col) => (
                            <TableCell key={col}>
                                <Input
                                    placeholder={`Filter ${col}`}
                                    onChange={(e) => handleFilterChange(col, e.target.value)}
                                />
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedData?.map((product) => (
                        <TableRow key={product.id}>
                            <TableCell>
                                <Checkbox
                                    checked={selectedRows.includes(product.id)}
                                    onCheckedChange={() => handleSelectRow(product.id)}
                                />
                            </TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{product.status}</TableCell>
                            <TableCell>{product.inventory}</TableCell>
                            <TableCell>{product.sales_channel}</TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell>{product.vendor}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="flex justify-between mt-4">
                <Button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                    Previous
                </Button>
                <span>Page {currentPage}</span>
                <Button
                    disabled={currentPage * pageSize >= (filteredData?.length || 0)}
                    onClick={() => setCurrentPage((p) => p + 1)}
                >
                    Next
                </Button>
            </div>
        </div>
    );
};

export default ProductTable;
