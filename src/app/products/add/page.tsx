"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface Variant {
  color: string;
  price: number;
  stock: number;
  image: string;
}

// Add this interface at the top after the existing Variant interface
interface SpecificationItem {
  key: string;
  value: string;
}

interface SpecificationCategory {
  name: string;
  specs: SpecificationItem[];
}

export default function AddProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    featuredImage: "",
    images: [""],
    category: "",
    code: "",
    brand: "",
    originalPrice: 0,
    discountPrice: 0,
    sold: 0,
    totalStock: 0,
    rating: 0,
    hasVariants: false,
    description: "",
    features: [""],
    isFlashSale: false,
    flashSaleEnd: "",
  });

  const [variants, setVariants] = useState<Variant[]>([]);
  const [showVariants, setShowVariants] = useState(false);

  const [specifications, setSpecifications] = useState<SpecificationCategory[]>(
    []
  );

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
          ? Number(value)
          : value,
    }));
  };

  const handleArrayChange = (
    index: number,
    value: string,
    field: "images" | "features"
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addArrayField = (field: "images" | "features") => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayField = (index: number, field: "images" | "features") => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      { color: "", price: 0, stock: 0, image: "" },
    ]);
  };

  const updateVariant = (
    index: number,
    field: keyof Variant,
    value: string | number
  ) => {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      )
    );
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  // --- Specification functions (array-based to preserve order) ---
  const addSpecificationCategory = () => {
    setSpecifications((prev) => [
      ...prev,
      { name: "", specs: [{ key: "", value: "" }] },
    ]);
  };

  const removeSpecificationCategory = (index: number) => {
    if (specifications.length > 1) {
      setSpecifications((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const updateSpecificationCategoryName = (index: number, name: string) => {
    setSpecifications((prev) =>
      prev.map((cat, i) => (i === index ? { ...cat, name } : cat))
    );
  };

  const addSpecificationItem = (categoryIndex: number) => {
    setSpecifications((prev) =>
      prev.map((cat, i) =>
        i === categoryIndex
          ? { ...cat, specs: [...cat.specs, { key: "", value: "" }] }
          : cat
      )
    );
  };

  const updateSpecificationItem = (
    categoryIndex: number,
    specIndex: number,
    field: "key" | "value",
    newValue: string
  ) => {
    setSpecifications((prev) =>
      prev.map((cat, i) =>
        i === categoryIndex
          ? {
              ...cat,
              specs: cat.specs.map((s, j) =>
                j === specIndex ? { ...s, [field]: newValue } : s
              ),
            }
          : cat
      )
    );
  };

  const removeSpecificationItem = (
    categoryIndex: number,
    specIndex: number
  ) => {
    setSpecifications((prev) =>
      prev.map((cat, i) =>
        i === categoryIndex
          ? { ...cat, specs: cat.specs.filter((_, j) => j !== specIndex) }
          : cat
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const productData = {
        ...formData,
        images: formData.images.filter((img) => img.trim() !== ""),
        features: formData.features.filter((feature) => feature.trim() !== ""),
        specifications: specifications.map((cat) => ({
          name: cat.name,
          specs: cat.specs.filter((s) => s.key.trim() || s.value.trim()),
        })),
        discountPrice: formData.discountPrice || undefined,
        rating: formData.rating || 0,
        flashSaleEnd: formData.flashSaleEnd
          ? new Date(formData.flashSaleEnd)
          : undefined,
        variants: showVariants ? variants : [],
      };

      await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/admin/add-product`,
        productData
      );

      console.log(productData);
    } catch (error) {
      alert("Error creating product. Please check your input.");
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Add New Product
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Fill in the product information. All fields marked with * are
              required.
            </p>
          </div>
        </div>

        <div className="mt-5 md:mt-0 md:col-span-2">
          <form onSubmit={handleSubmit}>
            <div className="shadow sm:rounded-md sm:overflow-hidden">
              <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                {/* Basic Information */}
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Product Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border px-3 py-2"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Category *
                    </label>
                    <input
                      type="text"
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border px-3 py-2"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Brand *
                    </label>
                    <input
                      type="text"
                      name="brand"
                      required
                      value={formData.brand}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border px-3 py-2"
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Code *
                    </label>
                    <input
                      type="text"
                      name="code"
                      required
                      value={formData.code}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border px-3 py-2"
                    />
                  </div>
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Featured Image URL *
                  </label>
                  <input
                    type="url"
                    name="featuredImage"
                    required
                    value={formData.featuredImage}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Images
                  </label>
                  {formData.images.map((image, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 mb-2"
                    >
                      <input
                        type="url"
                        value={image}
                        onChange={(e) =>
                          handleArrayChange(index, e.target.value, "images")
                        }
                        placeholder="Image URL"
                        className="flex-1 focus:ring-blue-500 focus:border-blue-500 block shadow-sm sm:text-sm border-gray-300 rounded-md border px-3 py-2"
                      />
                      {formData.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayField(index, "images")}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField("images")}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Image
                  </button>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Original Price *
                    </label>
                    <input
                      type="number"
                      name="originalPrice"
                      required
                      min="0"
                      value={formData.originalPrice}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border px-3 py-2"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Discount Price
                    </label>
                    <input
                      type="number"
                      name="discountPrice"
                      min="0"
                      value={formData.discountPrice}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border px-3 py-2"
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Total Stock *
                    </label>
                    <input
                      type="number"
                      name="totalStock"
                      required
                      min="0"
                      value={formData.totalStock}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border px-3 py-2"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description (HTML)
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter HTML description for your product..."
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border px-3 py-2"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    You can use HTML tags like {"<p>"}, {"<strong>"}, {"<em>"},{" "}
                    {"<ul>"}, {"<li>"}, etc.
                  </p>
                </div>

                {/* Features */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Features
                  </label>
                  {formData.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 mb-2"
                    >
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) =>
                          handleArrayChange(index, e.target.value, "features")
                        }
                        placeholder="Feature"
                        className="flex-1 focus:ring-blue-500 focus:border-blue-500 block shadow-sm sm:text-sm border-gray-300 rounded-md border px-3 py-2"
                      />
                      {formData.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayField(index, "features")}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField("features")}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Feature
                  </button>
                </div>

                {/* Specifications */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Product Specifications
                  </label>
                  {specifications.map((category, categoryIndex) => (
                    <div
                      key={categoryIndex}
                      className="border border-gray-200 rounded-md p-4 mb-4 bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <input
                          type="text"
                          value={category.name}
                          onChange={(e) =>
                            updateSpecificationCategoryName(
                              categoryIndex,
                              e.target.value
                            )
                          }
                          placeholder="Category Name (e.g., Basic Information, Exterior, Warranty Information)"
                          className="flex-1 focus:ring-blue-500 focus:border-blue-500 block shadow-sm sm:text-sm border-gray-300 rounded-md border px-3 py-2 font-medium bg-white"
                        />
                        {specifications.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              removeSpecificationCategory(categoryIndex)
                            }
                            className="ml-2 text-red-600 hover:text-red-800 px-3 py-1 border border-red-300 rounded-md hover:bg-red-50"
                          >
                            Remove Category
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        {category.specs.map((spec, specIndex) => (
                          <div
                            key={`${categoryIndex}-${specIndex}`}
                            className="bg-white p-3 rounded border"
                          >
                            <div className="grid grid-cols-12 gap-2 items-center">
                              <div className="col-span-4">
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                  Specification Name
                                </label>
                                <input
                                  type="text"
                                  value={spec.key}
                                  onChange={(e) =>
                                    updateSpecificationItem(
                                      categoryIndex,
                                      specIndex,
                                      "key",
                                      e.target.value
                                    )
                                  }
                                  placeholder="e.g., display, memory, battery"
                                  className="w-full focus:ring-blue-500 focus:border-blue-500 block shadow-sm sm:text-sm border-gray-300 rounded-md border px-3 py-2"
                                />
                              </div>
                              <div className="col-span-6">
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                  Specification Value
                                </label>
                                <input
                                  type="text"
                                  value={spec.value}
                                  onChange={(e) =>
                                    updateSpecificationItem(
                                      categoryIndex,
                                      specIndex,
                                      "value",
                                      e.target.value
                                    )
                                  }
                                  placeholder="e.g., 1.32inch AMOLED (454×454)"
                                  className="w-full focus:ring-blue-500 focus:border-blue-500 block shadow-sm sm:text-sm border-gray-300 rounded-md border px-3 py-2"
                                />
                              </div>
                              <div className="col-span-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeSpecificationItem(
                                      categoryIndex,
                                      specIndex
                                    )
                                  }
                                  className="w-full text-red-600 hover:text-red-800 text-sm py-2 px-2 border border-red-300 rounded-md hover:bg-red-50"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => addSpecificationItem(categoryIndex)}
                          className="w-full text-blue-600 hover:text-blue-800 text-sm py-2 px-4 border border-blue-300 rounded-md hover:bg-blue-50 bg-white"
                        >
                          + Add Specification to{" "}
                          {category.name || "this category"}
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addSpecificationCategory}
                    className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 font-medium"
                  >
                    + Add New Category
                  </button>
                </div>

                {/* Flash Sale */}
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="isFlashSale"
                      name="isFlashSale"
                      type="checkbox"
                      checked={formData.isFlashSale}
                      onChange={handleInputChange}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="isFlashSale"
                      className="font-medium text-gray-700"
                    >
                      Flash Sale
                    </label>
                    <p className="text-gray-500">
                      Mark this product as a flash sale item.
                    </p>
                  </div>
                </div>

                {formData.isFlashSale && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Flash Sale End Date
                    </label>
                    <input
                      type="datetime-local"
                      name="flashSaleEnd"
                      value={formData.flashSaleEnd}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border px-3 py-2"
                    />
                  </div>
                )}

                {/* Variants Section */}
                <div className="border-t pt-6">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="hasVariants"
                        type="checkbox"
                        checked={showVariants}
                        onChange={(e) => {
                          setShowVariants(e.target.checked);
                          setFormData((prev) => ({
                            ...prev,
                            hasVariants: e.target.checked,
                          }));
                        }}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor="hasVariants"
                        className="font-medium text-gray-700"
                      >
                        Add Product Variants
                      </label>
                      <p className="text-gray-500">
                        Add color variants with different prices and stock.
                      </p>
                    </div>
                  </div>

                  {showVariants && (
                    <div className="mt-4">
                      <h4 className="text-md font-medium text-gray-900 mb-4">
                        Product Variants
                      </h4>
                      {variants.map((variant, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-md p-4 mb-4"
                        >
                          <div className="grid grid-cols-4 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Color
                              </label>
                              <input
                                type="text"
                                value={variant.color}
                                onChange={(e) =>
                                  updateVariant(index, "color", e.target.value)
                                }
                                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border px-3 py-2"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Price
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={variant.price}
                                onChange={(e) =>
                                  updateVariant(
                                    index,
                                    "price",
                                    Number(e.target.value)
                                  )
                                }
                                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border px-3 py-2"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Stock
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={variant.stock}
                                onChange={(e) =>
                                  updateVariant(
                                    index,
                                    "stock",
                                    Number(e.target.value)
                                  )
                                }
                                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border px-3 py-2"
                              />
                            </div>
                            <div className="flex items-end">
                              <button
                                type="button"
                                onClick={() => removeVariant(index)}
                                className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">
                              Image URL
                            </label>
                            <input
                              type="url"
                              value={variant.image}
                              onChange={(e) =>
                                updateVariant(index, "image", e.target.value)
                              }
                              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border px-3 py-2"
                            />
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addVariant}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                      >
                        Add Variant
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create Product
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
