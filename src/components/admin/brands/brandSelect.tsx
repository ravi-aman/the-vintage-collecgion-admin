import { useState, useEffect } from "react";
import { useGetActiveBrandsQuery } from "../../../redux/features/brandApi";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
    SelectGroup,
    SelectLabel,
    SelectSeparator
} from "../../..//components/ui/select";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Loader2, AlertCircle, Search, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "../../../components/ui/alert";

const BrandSelect = ({ onBrandSelect, defaultBrandId = "", required = true }) => {
    // Fetch active brands with proper error handling
    const {
        data,
        isLoading: brandsLoading,
        isError: brandsError,
        refetch,
        error
    } = useGetActiveBrandsQuery({});

    // State management
    const [selectedBrandId, setSelectedBrandId] = useState(defaultBrandId);
    const [selectedBrandName, setSelectedBrandName] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredBrands, setFilteredBrands] = useState([]);
    const [isSelectOpen, setIsSelectOpen] = useState(false);

    // Process the brands data
    const brands = data?.result || [];

    // Filter brands based on search term
    useEffect(() => {
        if (brands.length > 0) {
            const filtered = searchTerm
                ? brands.filter(brand =>
                    brand.name.toLowerCase().includes(searchTerm.toLowerCase()))
                : brands;

            setFilteredBrands(filtered);
        } else {
            setFilteredBrands([]);
        }
    }, [searchTerm, brands]);

    // Set default brand if available on initial load
    useEffect(() => {
        if (defaultBrandId && brands.length > 0) {
            const defaultBrand = brands.find(brand => brand.id === defaultBrandId);
            if (defaultBrand) {
                setSelectedBrandId(defaultBrand.id);
                setSelectedBrandName(defaultBrand.name);
            }
        }
    }, [defaultBrandId, brands]);

    // Handle brand selection
    const handleBrandSelect = (value) => {
        const selected = brands.find(brand => brand.id === value) || { id: "", name: "" };
        setSelectedBrandId(selected.id);
        setSelectedBrandName(selected.name);

        // Reset search term when selection is made
        setSearchTerm("");

        // Callback for parent components
        if (onBrandSelect && typeof onBrandSelect === 'function') {
            onBrandSelect(selected);
        }
    };

    // Group brands alphabetically for better organization
    const groupedBrands = filteredBrands.reduce((acc, brand) => {
        const firstLetter = brand.name.charAt(0).toUpperCase();
        if (!acc[firstLetter]) {
            acc[firstLetter] = [];
        }
        acc[firstLetter].push(brand);
        return acc;
    }, {});

    return (
        <div className="space-y-2">
            <Label htmlFor="brand">
                Brand {required && <span className="text-red-500">*</span>}
            </Label>

            <Select
                value={selectedBrandId}
                onValueChange={handleBrandSelect}
                onOpenChange={setIsSelectOpen}
            >
                <SelectTrigger className="w-full relative">
                    <SelectValue
                        placeholder={brandsLoading ? "Loading brands..." : "Select brand"}
                    />
                    {brandsLoading && (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-500 absolute right-8" />
                    )}
                </SelectTrigger>

                <SelectContent className="max-h-96">
                    {brandsLoading ? (
                        <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            <span>Loading brands...</span>
                        </div>
                    ) : brandsError ? (
                        <div className="p-4 space-y-3">
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    {typeof error === "string"
                                        ? error
                                        : "Failed to load brands"}
                                </AlertDescription>
                            </Alert>
                            <button
                                onClick={() => refetch()}
                                className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="p-2 sticky top-0 bg-white z-10 border-b">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                                    <Input
                                        placeholder="Search brands..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                            </div>

                            {filteredBrands.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">
                                    No brands found matching "{searchTerm}"
                                </div>
                            ) : (
                                Object.keys(groupedBrands).sort().map(letter => (
                                    <SelectGroup key={letter}>
                                        <SelectLabel className="text-xs font-semibold text-gray-500 px-2">
                                            {letter}
                                        </SelectLabel>
                                        {groupedBrands[letter].map((brand) => (
                                            <SelectItem
                                                key={brand.id}
                                                value={brand.id}
                                                className="flex justify-between items-center"
                                            >
                                                <span>{brand.name}</span>
                                                {selectedBrandId === brand.id && (
                                                    <CheckCircle2 className="h-4 w-4 text-green-500 ml-2" />
                                                )}
                                            </SelectItem>
                                        ))}
                                        <SelectSeparator />
                                    </SelectGroup>
                                ))
                            )}
                        </>
                    )}
                </SelectContent>
            </Select>

            {selectedBrandId && (
                <div className="flex items-center text-sm text-green-600">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    <span>Selected: {selectedBrandName}</span>
                </div>
            )}
        </div>
    );
};

export default BrandSelect;