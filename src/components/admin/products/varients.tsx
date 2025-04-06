import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ImagePlus, Check, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '../../../hooks/use-toast';
import { uploadMultipleToCloudinary, deleteImageFromCloudinary } from 'utils/uploadToCloudinary';
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Plus, X } from "lucide-react";
import { TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip';
import { Tooltip } from '../../../components/ui/tooltip';


const ColorVariantsManager = ({ colorVariants, setColorVariants, sizes }) => {
    const [newColorName, setNewColorName] = useState('');
    const [newColorCode, setNewColorCode] = useState('#000000');
    const [newColorImages, setNewColorImages] = useState([]);
    const [newColorSizes, setNewColorSizes] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState({});
    const fileInputRef = useRef(null);
    const { toast } = useToast();

    // Track which color variant's images are being viewed in a carousel
    const handleImageNavigation = (variantIndex, direction) => {
        setCurrentImageIndex(prev => {
            const current = prev[variantIndex] || 0;
            const images = colorVariants[variantIndex].images || [colorVariants[variantIndex].img];
            const newIndex = direction === 'next'
                ? (current + 1) % images.length
                : (current - 1 + images.length) % images.length;

            return { ...prev, [variantIndex]: newIndex };
        });
    };

    const removeColorVariant = async (index) => {
        try {
            // If there are images to delete from cloudinary
            const variant = colorVariants[index];
            if (variant.img) {
                await deleteImageFromCloudinary(variant.img);
            }
            if (variant.images && variant.images.length > 0) {
                await Promise.all(variant.images.map(img => deleteImageFromCloudinary(img)));
            }

            const updatedVariants = [...colorVariants];
            updatedVariants.splice(index, 1);
            setColorVariants(updatedVariants);

            toast({
                title: "Variant removed",
                description: `${variant.color.name} variant has been removed`,
                variant: "default"
            });
        } catch (error) {
            console.error("Error removing variant:", error);
            toast({
                title: "Error",
                description: "Failed to remove variant",
                variant: "destructive"
            });
        }
    };

    const addColorVariant = async () => {
        if (!newColorName || !newColorCode || newColorImages.length === 0 || newColorSizes.length === 0) {
            toast({
                title: "Validation Error",
                description: "Please fill all fields and select at least one size",
                variant: "destructive"
            });
            return;
        }

        setIsUploading(true);
        try {
            const imageInfos = await uploadMultipleToCloudinary(newColorImages);

            if (!imageInfos.length) {
                throw new Error("Failed to upload images");
            }

            const newVariant = {
                color: {
                    name: newColorName,
                    clrCode: newColorCode
                },
                img: imageInfos[0].url,              // ✅ First image URL as main image
                images: imageInfos.map(img => img.url), // ✅ All image URLs
                sizes: newColorSizes
            };

            setColorVariants([...colorVariants, newVariant]);

            // Reset form
            setNewColorName('');
            setNewColorCode('#000000');
            setNewColorImages([]);
            setNewColorSizes([]);

            toast({
                title: "Success",
                description: `${newColorName} variant has been added`,
                variant: "default"
            });
        } catch (error) {
            console.error("Error adding color variant:", error);
            toast({
                title: "Error",
                description: "Failed to add color variant",
                variant: "destructive"
            });
        } finally {
            setIsUploading(false);
        }
    }

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setNewColorImages(prev => [...prev, ...files]);
        }
    };

    const removeImage = (index) => {
        setNewColorImages(prev => prev.filter((_, i) => i !== index));
    };

    // Function to save the data in the format required
    const getImageURLsFormatted = () => {
        return colorVariants.map(variant => ({
            color: {
                name: variant.color.name,
                clrCode: variant.color.clrCode
            },
            img: variant.img,
            sizes: variant.sizes.map(size => size)
        }));
    };

    // Animation variants for Framer Motion
    const fadeInOut = {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, transition: { duration: 0.2 } }
    };

    const slideIn = {
        initial: { x: 20, opacity: 0 },
        animate: { x: 0, opacity: 1, transition: { duration: 0.3 } },
        exit: { x: -20, opacity: 0, transition: { duration: 0.2 } }
    };

    return (
        <TooltipProvider>
            <Card className="overflow-hidden border-none shadow-md">
                <CardContent className="pt-6">
                    <Label className="text-lg font-semibold">Color Variants</Label>

                    {/* Existing Color Variants */}
                    <AnimatePresence>
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
                            initial="initial"
                            animate="animate"
                            variants={{
                                animate: { transition: { staggerChildren: 0.1 } }
                            }}
                        >
                            {colorVariants.map((variant, index) => {
                                const images = variant.images || [variant.img];
                                const currentImg = images[currentImageIndex[index] || 0];

                                return (
                                    <motion.div
                                        key={index}
                                        className="border rounded-lg p-4 relative bg-white hover:shadow-md transition-shadow duration-300"
                                        variants={fadeInOut}
                                        layout
                                    >
                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            className="absolute top-2 right-2 h-6 w-6 opacity-70 hover:opacity-100 transition-opacity"
                                            onClick={() => removeColorVariant(index)}
                                        >
                                            <X size={14} />
                                        </Button>

                                        <div className="flex gap-4">
                                            <div className="relative">
                                                <div
                                                    className="w-20 h-20 rounded-md overflow-hidden border group relative"
                                                    style={{ backgroundColor: variant.color.clrCode }}
                                                >
                                                    {currentImg && (
                                                        <Image
                                                            src={currentImg}
                                                            alt={variant.color.name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                            width={80}
                                                            height={80}
                                                        />
                                                    )}

                                                    {/* Image count indicator */}
                                                    {images.length > 1 && (
                                                        <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-xs rounded px-1.5 py-0.5">
                                                            {(currentImageIndex[index] || 0) + 1}/{images.length}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Image navigation dots */}
                                                {images.length > 1 && (
                                                    <div className="flex justify-center mt-2 gap-1">
                                                        {images.map((_, imgIndex) => (
                                                            <button
                                                                key={imgIndex}
                                                                className={`w-1.5 h-1.5 rounded-full transition-all ${(currentImageIndex[index] || 0) === imgIndex
                                                                    ? 'bg-black scale-110'
                                                                    : 'bg-gray-300'
                                                                    }`}
                                                                onClick={() => setCurrentImageIndex({ ...currentImageIndex, [index]: imgIndex })}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <p className="font-medium">{variant.color.name}</p>
                                                <p className="text-sm text-gray-500">{variant.color.clrCode}</p>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {variant.sizes.map((size, i) => (
                                                        <Badge key={i} variant="secondary" className="text-xs">
                                                            {size}
                                                        </Badge>
                                                    ))}
                                                </div>
                                                <div className="mt-2">
                                                    <p className="text-xs text-gray-500">{images.length} image{images.length !== 1 ? 's' : ''}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </AnimatePresence>

                    {/* Add New Color Variant */}
                    <motion.div
                        className="mt-6 border rounded-lg p-4 bg-white shadow-sm"
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <h4 className="font-medium mb-3 flex items-center">
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Color Variant
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="colorName">Color Name</Label>
                                <Input
                                    id="colorName"
                                    value={newColorName}
                                    onChange={(e) => setNewColorName(e.target.value)}
                                    placeholder="e.g. Midnight Blue"
                                    className="focus:ring-1 focus:ring-black"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="colorCode">Color Code</Label>
                                <div className="flex gap-2 items-center">
                                    <motion.div
                                        className="w-10 h-10 rounded-md border"
                                        style={{ backgroundColor: newColorCode }}
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.2 }}
                                    />
                                    <Input
                                        id="colorCode"
                                        type="color"
                                        value={newColorCode}
                                        onChange={(e) => setNewColorCode(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="colorImages">Color Images</Label>
                                <AnimatePresence>
                                    {newColorImages.length > 0 && (
                                        <motion.div
                                            className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3"
                                            variants={fadeInOut}
                                            initial="initial"
                                            animate="animate"
                                            exit="exit"
                                        >
                                            {newColorImages.map((image, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden group"
                                                    variants={slideIn}
                                                >
                                                    <Image
                                                        src={URL.createObjectURL(image)}
                                                        alt={`Color variant ${idx + 1}`}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        width={100}
                                                        height={100}
                                                    />
                                                    <Button
                                                        size="icon"
                                                        variant="destructive"
                                                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => removeImage(idx)}
                                                    >
                                                        <Trash2 size={12} />
                                                    </Button>
                                                    {idx === 0 && (
                                                        <Badge className="absolute bottom-1 left-1 text-xs bg-black bg-opacity-70">
                                                            Main
                                                        </Badge>
                                                    )}
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div
                                            className="border border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <motion.div
                                                whileHover={{ scale: 1.03 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <ImagePlus className="h-6 w-6 mx-auto text-gray-400" />
                                                <p className="mt-1 text-sm text-gray-500">Upload Images</p>
                                                <p className="text-xs text-gray-400">First image will be the main preview</p>
                                                <Input
                                                    ref={fileInputRef}
                                                    id="colorImages"
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handleFileSelect}
                                                />
                                            </motion.div>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>You can select multiple images at once</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>

                            <div className="space-y-2">
                                <Label>Available Sizes for this Color</Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {sizes.map((size, index) => (
                                        <motion.div
                                            key={index}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Badge
                                                variant={newColorSizes.includes(size) ? "default" : "outline"}
                                                className={`px-3 py-1 cursor-pointer transition-all duration-200 ${newColorSizes.includes(size)
                                                    ? 'bg-black text-white'
                                                    : 'bg-white hover:bg-gray-50'
                                                    }`}
                                                onClick={() => {
                                                    if (newColorSizes.includes(size)) {
                                                        setNewColorSizes(newColorSizes.filter(s => s !== size));
                                                    } else {
                                                        setNewColorSizes([...newColorSizes, size]);
                                                    }
                                                }}
                                            >
                                                {size}
                                                {newColorSizes.includes(size) && (
                                                    <Check className="ml-1 h-3 w-3 inline" />
                                                )}
                                            </Badge>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <motion.div
                            className="mt-4"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button
                                type="button"
                                onClick={addColorVariant}
                                className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white"
                                disabled={isUploading || !newColorName || !newColorCode || newColorImages.length === 0 || newColorSizes.length === 0}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Color Variant
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    </motion.div>
                </CardContent>
            </Card>
        </TooltipProvider>
    );
};

export default ColorVariantsManager;