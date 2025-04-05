"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableCell,
    TableFooter,

} from "../../../components/ui/table";
import { Button } from "../../../components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue

} from "../../../components/ui/select";
import { Checkbox } from "../../../components/ui/checkbox";
import { Input } from "../../../components/ui/input";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator,
} from "../../../components/ui/breadcrumb";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "../../../components/ui/card";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "../../../components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../../../components/ui/dialog";
import { Badge } from "../../../components/ui/badge";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Separator } from "../../../components/ui/separator";
import { Skeleton } from "../../../components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import {
    ChevronLeft,
    ChevronRight,
    Filter,
    Trash,
    Download,
    MoreHorizontal,
    FileText,
    RefreshCw,
    Search,
    Plus,
    Settings,
    Grid,
    List,
    ArrowUpDown,
    X,
    AlertTriangle,
    Save
} from "lucide-react";
import * as XLSX from 'xlsx';
import AddProduct from "./addProducts";

export interface Product {
    id: string;
    name: string;
    status: string;
    inventory: number | string;
    sales_channel: string;
    category: string;
    vendor: string;
    sku: string;
    price: number;
    cost: number;
    margin: number;
    created_at: string;
    updated_at: string;
    tags: string[];
    image_url?: string;
}

interface ProductTableProps {
    products: Product[];
    isLoading?: boolean;
    onProductUpdate?: (product: Product) => Promise<void>;
    onProductDelete?: (ids: string[]) => Promise<void>;
    onProductCreate?: (product: Partial<Product>) => Promise<void>;
    categories?: string[];
    vendors?: string[];
    statusOptions?: string[];
    salesChannels?: string[];
}

const statusColorMap: Record<string, string> = {
    "active": "bg-green-100 text-green-800",
    "inactive": "bg-gray-100 text-gray-800",
    "draft": "bg-yellow-100 text-yellow-800",
    "archived": "bg-red-100 text-red-800",
    "out_of_stock": "bg-orange-100 text-orange-800",
};

const ProductTable: React.FC<ProductTableProps> = ({
    products,
    isLoading = false,
    onProductUpdate,
    onProductDelete,
    onProductCreate,
    categories = [],
    vendors = [],
    statusOptions = ["active", "inactive", "draft", "archived", "out_of_stock","in_stock"],
    salesChannels = ["online", "in_store", "marketplace", "wholesale"]
}) => {
    // State variables
    const [pageSize, setPageSize] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [filters, setFilters] = useState<{ [key: string]: any }>({});
    const [sortColumn, setSortColumn] = useState<string>("name");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [viewMode, setViewMode] = useState<"table" | "grid">("table");
    const [advancedFiltersVisible, setAdvancedFiltersVisible] = useState<boolean>(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [isExporting, setIsExporting] = useState<boolean>(false);
    const [filterPresets, setFilterPresets] = useState<{ name: string, filters: { [key: string]: any } }[]>([]);
    const [selectedFilterPreset, setSelectedFilterPreset] = useState<string | null>(null);
    const [dateRangeFilter, setDateRangeFilter] = useState<{ start: string | null, end: string | null }>({ start: null, end: null });
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

    // Filter and sort the data
    const filteredAndSortedData = useMemo(() => {
        let filteredData = [...products];

        // Apply search query across all text fields
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filteredData = filteredData.filter(product =>
                product.name.toLowerCase().includes(query) ||
                product.sku?.toLowerCase().includes(query) ||
                product.vendor.toLowerCase().includes(query) ||
                product.category.toLowerCase().includes(query) ||
                product.tags?.some(tag => tag.toLowerCase().includes(query))
            );
        }

        // Apply filters
        filteredData = filteredData.filter(product => {
            return Object.entries(filters).every(([key, value]) => {
                if (!value || value === "") return true;

                const productValue = product[key as keyof Product];

                if (key === "tags" && Array.isArray(product.tags)) {
                    return product.tags.includes(value as string);
                }

                if (key === "price" || key === "cost" || key === "margin" || key === "inventory") {
                    const numValue = typeof productValue === "string" ? parseFloat(productValue) : (productValue as number);
                    const [min, max] = Array.isArray(value) ? value : [null, null];

                    if (min !== null && max !== null) {
                        return numValue >= min && numValue <= max;
                    } else if (min !== null) {
                        return numValue >= min;
                    } else if (max !== null) {
                        return numValue <= max;
                    }
                    return true;
                }

                if (key === "created_at" || key === "updated_at") {
                    const date = new Date(productValue as string);
                    const filterDate = new Date(value as string);
                    return date >= filterDate;
                }

                if (typeof productValue === "string") {
                    return productValue.toLowerCase().includes((value as string).toLowerCase());
                }

                return false;
            });
        });

        // Apply date range filter
        if (dateRangeFilter.start || dateRangeFilter.end) {
            filteredData = filteredData.filter(product => {
                const createdDate = new Date(product.created_at);

                if (dateRangeFilter.start && dateRangeFilter.end) {
                    return createdDate >= new Date(dateRangeFilter.start) &&
                        createdDate <= new Date(dateRangeFilter.end);
                } else if (dateRangeFilter.start) {
                    return createdDate >= new Date(dateRangeFilter.start);
                } else if (dateRangeFilter.end) {
                    return createdDate <= new Date(dateRangeFilter.end);
                }

                return true;
            });
        }

        // Sort the data
        if (sortColumn) {
            filteredData.sort((a, b) => {
                const valA = a[sortColumn as keyof Product];
                const valB = b[sortColumn as keyof Product];

                if (typeof valA === "number" && typeof valB === "number") {
                    return sortOrder === "asc" ? valA - valB : valB - valA;
                }

                if (typeof valA === "string" && typeof valB === "string") {
                    return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
                }

                return 0;
            });
        }

        return filteredData;
    }, [products, filters, sortColumn, sortOrder, searchQuery, dateRangeFilter]);

    // Paginated data for current view
    const paginatedData = useMemo(() => {
        return filteredAndSortedData.slice(
            (currentPage - 1) * pageSize,
            currentPage * pageSize
        );
    }, [filteredAndSortedData, currentPage, pageSize]);

    // Total pages calculation
    const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);

    // Effect to reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters, searchQuery, dateRangeFilter]);

    // Update active filters list for display
    useEffect(() => {
        const newActiveFilters = Object.entries(filters)
            .filter(([_, value]) => value !== "" && value !== null)
            .map(([key, value]) => {
                if (Array.isArray(value)) {
                    return `${key}: ${value[0]}-${value[1]}`;
                }
                return `${key}: ${value}`;
            });

        if (searchQuery) {
            newActiveFilters.push(`search: ${searchQuery}`);
        }

        if (dateRangeFilter.start || dateRangeFilter.end) {
            const dateFilterStr = `date: ${dateRangeFilter.start || 'any'} to ${dateRangeFilter.end || 'any'}`;
            newActiveFilters.push(dateFilterStr);
        }

        setActiveFilters(newActiveFilters);
    }, [filters, searchQuery, dateRangeFilter]);

    // Handler functions
    const handlePageSizeChange = (value: string) => {
        setPageSize(Number(value));
        setCurrentPage(1);
    };

    const handleSelectRow = (id: string) => {
        setSelectedRows((prev) =>
            prev.includes(id) ? prev.filter((row) => row !== id) : [...prev, id]
        );
    };

    const handleFilterChange = (field: string, value: any) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
        setSelectedFilterPreset(null);
    };

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortOrder("asc");
        }
    };

    const handleClearFilters = () => {
        setFilters({});
        setSearchQuery("");
        setDateRangeFilter({ start: null, end: null });
        setSelectedFilterPreset(null);
    };

    const handleRemoveFilter = (filter: string) => {
        const [key] = filter.split(":");
        if (key === "search") {
            setSearchQuery("");
        } else if (key === "date") {
            setDateRangeFilter({ start: null, end: null });
        } else {
            setFilters(prev => {
                const newFilters = { ...prev };
                delete newFilters[key];
                return newFilters;
            });
        }
    };

    const handleSaveFilterPreset = (name: string) => {
        if (!name) return;

        const newPreset = {
            name,
            filters: { ...filters, search: searchQuery, dateRange: dateRangeFilter }
        };

        setFilterPresets(prev => [...prev, newPreset]);
    };

    const handleApplyFilterPreset = (presetName: string) => {
        const preset = filterPresets.find(p => p.name === presetName);
        if (!preset) return;

        const { search, dateRange, ...presetFilters } = preset.filters;

        setFilters(presetFilters);
        setSearchQuery(search || "");
        setDateRangeFilter(dateRange || { start: null, end: null });
        setSelectedFilterPreset(presetName);
    };

    const handleExportData = async () => {
        setIsExporting(true);

        try {
            // Prepare data for export
            const dataToExport = selectedRows.length > 0
                ? filteredAndSortedData.filter(p => selectedRows.includes(p.id))
                : filteredAndSortedData;

            // Convert to Excel and download
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

            // Format columns
            const maxWidth = dataToExport.reduce((w, r) => Math.max(w, r.name.length), 10);
            worksheet["!cols"] = [{ wch: 10 }, { wch: maxWidth }, { wch: 12 }];

            // Download file
            XLSX.writeFile(workbook, `product-export-${new Date().toISOString().slice(0, 10)}.xlsx`);
        } catch (error) {
            console.error("Export failed:", error);
            // Would add toast notification here in a real app
        } finally {
            setIsExporting(false);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        // Simulate refresh - in a real app, this would fetch new data
        setTimeout(() => {
            setIsRefreshing(false);
        }, 1000);
    };

    const handleDeleteSelected = async () => {
        if (selectedRows.length === 0) return;

        if (onProductDelete) {
            try {
                await onProductDelete(selectedRows);
                setSelectedRows([]);
                setIsDeleteDialogOpen(false);
                // Would add success toast here
            } catch (error) {
                console.error("Delete failed:", error);
                // Would add error toast here
            }
        } else {
            // Demo functionality without actual API
            console.log("Deleting products:", selectedRows);
            setSelectedRows([]);
            setIsDeleteDialogOpen(false);
        }
    };

    // Render skeletons for loading state
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {Array(5).fill(0).map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Render data table
    return (
        <Card className="w-full shadow-lg">
            <CardHeader className="pb-2">
                <div className="flex flex-col gap-5 md:flex-row  justify-between items-center">
                    <div>
                        <CardTitle className="text-2xl font-bold">Products</CardTitle>
                        <CardDescription>
                            Manage your product inventory and listings
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
                            {isRefreshing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        </Button>
                        <Button variant="outline" onClick={() => setViewMode(viewMode === "table" ? "grid" : "table")}>
                            {viewMode === "table" ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                        </Button>
                        {/* Add product button components */}
                        <AddProduct />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0 pt-2">
                {/* Breadcrumb Navigation */}
                <div className="px-6 py-2">
                    <Breadcrumb className="flex justify-start items-center">
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/admin/products">Products</BreadcrumbLink>
                        </BreadcrumbItem>
                    </Breadcrumb>
                </div>

                {/* Search and Controls */}
                <div className="px-6 py-2 border-b">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                        <div className="flex flex-1 gap-2 items-center">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search products..."
                                    className="pl-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full"
                                        onClick={() => setSearchQuery("")}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => setAdvancedFiltersVisible(!advancedFiltersVisible)}
                            >
                                <Filter className="w-4 h-4 mr-2" /> Filters
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        <Settings className="w-4 h-4 mr-2" /> Presets
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {filterPresets.map(preset => (
                                        <DropdownMenuItem
                                            key={preset.name}
                                            onClick={() => handleApplyFilterPreset(preset.name)}
                                        >
                                            {preset.name}
                                        </DropdownMenuItem>
                                    ))}
                                    {filterPresets.length > 0 && <DropdownMenuSeparator />}
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                Save current filters
                                            </DropdownMenuItem>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Save Filter Preset</DialogTitle>
                                                <DialogDescription>
                                                    Create a name for your current filter configuration
                                                </DialogDescription>
                                            </DialogHeader>
                                            <Input
                                                id="preset-name"
                                                placeholder="Enter preset name"
                                                className="mt-2"
                                            />
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => { }}>Cancel</Button>
                                                <Button onClick={() => {
                                                    const input = document.getElementById('preset-name') as HTMLInputElement;
                                                    handleSaveFilterPreset(input?.value);
                                                }}>
                                                    Save
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className="flex gap-2 items-center">
                            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        disabled={selectedRows.length === 0}
                                    >
                                        <Trash className="w-4 h-4 mr-2" /> Delete
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Confirm Deletion</DialogTitle>
                                        <DialogDescription>
                                            Are you sure you want to delete {selectedRows.length} selected product{selectedRows.length !== 1 ? 's' : ''}? This action cannot be undone.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                                        <Button variant="destructive" onClick={handleDeleteSelected}>
                                            Delete {selectedRows.length} product{selectedRows.length !== 1 ? 's' : ''}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                            <Button
                                variant="outline"
                                onClick={handleExportData}
                                disabled={isExporting || filteredAndSortedData.length === 0}
                            >
                                {isExporting ? (
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Download className="w-4 h-4 mr-2" />
                                )}
                                Export
                            </Button>
                        </div>
                    </div>

                    {/* Advanced filters section */}
                    {advancedFiltersVisible && (
                        <div className="mt-4 p-4 border rounded-md w-full">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Status</label>
                                    <Select
                                        value={filters.status || "any"}
                                        onValueChange={(value) => handleFilterChange("status", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Any status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="any">Any status</SelectItem>
                                            {statusOptions.map(status => (
                                                <SelectItem key={status} value={status}>
                                                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Category</label>
                                    <Select
                                        value={filters.category || "any"}
                                        onValueChange={(value) =>
                                            handleFilterChange("category", value === "any" ? "" : value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Any category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="any">Any category</SelectItem>
                                            {categories.map((category) => (
                                                <SelectItem key={category} value={category}>
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                </div>
                                <div>
                                    <label className="text-sm font-medium">Vendor</label>
                                    <Select
                                        value={filters.vendor || "any"}
                                        onValueChange={(value) => handleFilterChange("vendor", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Any vendor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="any">Any vendor</SelectItem>
                                            {vendors.map(vendor => (
                                                <SelectItem key={vendor} value={vendor}>
                                                    {vendor}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Sales Channel</label>
                                    <Select
                                        value={filters.sales_channel || "any"}
                                        onValueChange={(value) => handleFilterChange("sales_channel", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Any channel" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="any">Any channel</SelectItem>
                                            {salesChannels.map(channel => (
                                                <SelectItem key={channel} value={channel}>
                                                    {channel.charAt(0).toUpperCase() + channel.slice(1).replace('_', ' ')}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Created After</label>
                                    <Input
                                        type="date"
                                        value={dateRangeFilter.start || "any"}
                                        onChange={(e) => setDateRangeFilter(prev => ({ ...prev, start: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Created Before</label>
                                    <Input
                                        type="date"
                                        value={dateRangeFilter.end || "any"}
                                        onChange={(e) => setDateRangeFilter(prev => ({ ...prev, end: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end mt-4">
                                <Button variant="outline" onClick={handleClearFilters}>
                                    Clear Filters
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Active filters */}
                    {activeFilters.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {activeFilters.map((filter, index) => (
                                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                    {filter}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-4 w-4 p-0 ml-1"
                                        onClick={() => handleRemoveFilter(filter)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            ))}
                            {activeFilters.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-xs"
                                    onClick={handleClearFilters}
                                >
                                    Clear all
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Results summary */}
                <div className="p-4 bg-white rounded-lg shadow-md">
                    <div className="flex justify-between items-center border-b px-6 py-2 text-sm text-muted-foreground">
                        <div>
                            {selectedRows.length > 0 ? `${selectedRows.length} selected of ` : ""}
                            {filteredAndSortedData.length} product{filteredAndSortedData.length !== 1 ? "s" : ""}
                            {filteredAndSortedData.length !== products.length && ` (filtered from ${products.length})`}
                        </div>
                        <div className="flex items-center gap-2">
                            <span>Show</span>
                            <Select value={pageSize.toString()} onValueChange={(value) => handlePageSizeChange(value)}>
                                <SelectTrigger className="w-16 h-8">
                                    <SelectValue>{pageSize}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                            </Select>
                            <span>per page</span>
                        </div>
                    </div>
                    {filteredAndSortedData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium">No products found</h3>
                            <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
                            <Button className="mt-4" onClick={() => setFilters({})}>Clear Filters</Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableCell className="w-12">
                                            <Checkbox
                                                checked={selectedRows.length > 0 && selectedRows.length === paginatedData.length}
                                                onCheckedChange={(checked) => {
                                                    setSelectedRows(checked ? paginatedData.map((p) => p.id) : []);
                                                }}
                                            />
                                        </TableCell>
                                        {["s.no", "name", "sku", "status", "inventory", "price", "sales_channel", "category", "vendor", "updated_at"].map((col) => (
                                            <TableCell key={col} className="cursor-pointer" onClick={() => handleSort(col)}>
                                                <div className="flex items-center gap-1">
                                                    {col}
                                                    {sortColumn === col ? (
                                                        <span>{sortOrder === "asc" ? "▲" : "▼"}</span>
                                                    ) : (
                                                        <ArrowUpDown className="h-3 w-3 text-muted-foreground opacity-50" />
                                                    )}
                                                </div>
                                            </TableCell>
                                        ))}
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedData.map((product, index) => (
                                        <TableRow key={product.id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedRows.includes(product.id)}
                                                    onCheckedChange={() => handleSelectRow(product.id)}
                                                />
                                            </TableCell>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{product.name}</TableCell>
                                            <TableCell>{product.sku}</TableCell>
                                            <TableCell>{product.status}</TableCell>
                                            <TableCell>{product.inventory}</TableCell>
                                            <TableCell>{product.price}</TableCell>
                                            <TableCell>{product.sales_channel}</TableCell>
                                            <TableCell>{product.category}</TableCell>
                                            <TableCell>{product.vendor}</TableCell>
                                            <TableCell>{product.updated_at}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}



export default ProductTable;