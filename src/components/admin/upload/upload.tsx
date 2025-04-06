'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import { Upload, X } from 'lucide-react';

import { uploadMultipleToCloudinary,deleteImageFromCloudinary, } from "utils/uploadToCloudinary";
import { Label } from 'components/ui/label';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';


const ColorImageUploader = ({ onUpload }: { onUpload: (url: string) => void }) => {
    const [localImage, setLocalImage] = useState<File | null>(null);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = async (file: File) => {
        setLocalImage(file);
        setLoading(true);

        const urls = await uploadMultipleToCloudinary([file]);

        if (urls.length > 0) {
            setUploadedUrl(urls[0]);
            onUpload(urls[0]); 
        }

        setLoading(false);
    };

    const handleRemove = async () => {
        if (uploadedUrl) {
            const success = await deleteImageFromCloudinary(uploadedUrl);
            if (success) {
                setLocalImage(null);
                setUploadedUrl(null);
            }
        }
    };

    return (
        <div className="space-y-2">
            <Label htmlFor="colorImage">Color Image</Label>

            {uploadedUrl ? (
                <div className="relative w-full h-24 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                        src={uploadedUrl}
                        alt="Color variant"
                        className="w-full h-full object-contain"
                        width={20}
                        height={20}
                    />
                    <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={handleRemove}
                    >
                        <X size={14} />
                    </Button>
                </div>
            ) : (
                <div
                    className="border border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50"
                    onClick={() => document.getElementById('colorImage')?.click()}
                >
                    <Upload className="h-6 w-6 mx-auto text-gray-400" />
                    <p className="mt-1 text-xs text-gray-500">
                        {loading ? 'Uploading...' : 'Upload Image'}
                    </p>
                    <Input
                        id="colorImage"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileChange(file);
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default ColorImageUploader;
