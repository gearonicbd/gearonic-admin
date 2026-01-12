"use client";

import type React from "react";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { apiUrl } from "@/lib/api";
import type { Product } from "@/lib/dummy";

interface Variant {
  id: string;
  color: string;
  price: number;
  stock: number;
  image: string;
  productId: string;
}

// Add the same SpecificationCategory interface at the top
interface SpecificationCategory {
  name: string;
  specs: { [key: string]: string };
}

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    featuredImage: "",
    images: [""],
    category: "",
    brand: "",
    originalPrice: 0,
    discountPrice: 0,
    sold: 0,
    totalStock: 0,
    rating: 0,
    hasVariants: false,
    description: "",
    features: [""],
    specifications: "",
    isFlashSale: false,
    flashSaleEnd: "",
  });

  const [variants, setVariants] = useState<Variant[]>([]);
  const [showVariants, setShowVariants] = useState(false);

  // Replace the existing specifications state initialization
  const [specifications, setSpecifications] = useState<SpecificationCategory[]>(
    []
  );

  // Replace all the specification management functions with these corrected versions:
  const addSpecificationCategory = () => {
    setSpecifications((prev) => [...prev, { name: "", specs: { "": "" } }]);
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
      prev.map((cat, i) => {
        if (i === categoryIndex) {
          const newSpecs = { ...cat.specs };
          // Generate a unique temporary key
          const tempKey = `spec_${Date.now()}`;
          newSpecs[tempKey] = "";
          return { ...cat, specs: newSpecs };
        }
        return cat;
      })
    );
  };

  const updateSpecificationKey = (
    categoryIndex: number,
    oldKey: string,
    newKey: string
  ) => {
    setSpecifications((prev) =>
      prev.map((cat, i) => {
        if (i === categoryIndex) {
          const newSpecs = { ...cat.specs };
          const value = newSpecs[oldKey];
          delete newSpecs[oldKey];
          newSpecs[newKey] = value;
          return { ...cat, specs: newSpecs };
        }
        return cat;
      })
    );
  };

  const updateSpecificationValue = (
    categoryIndex: number,
    key: string,
    value: string
  ) => {
    setSpecifications((prev) =>
      prev.map((cat, i) => {
        if (i === categoryIndex) {
          return { ...cat, specs: { ...cat.specs, [key]: value } };
        }
        return cat;
      })
    );
  };

  const removeSpecificationItem = (categoryIndex: number, key: string) => {
    setSpecifications((prev) =>
      prev.map((cat, i) => {
        if (i === categoryIndex) {
          const newSpecs = { ...cat.specs };
          delete newSpecs[key];
          return { ...cat, specs: newSpecs };
        }
        return cat;
      })
    );
  };

  // Update the useEffect to load specifications correctly
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(apiUrl(`/api/admin/products/${id}`), {
          cache: "no-store",
        });
        const foundProduct = await res.json();
        if (foundProduct) {
          setProduct(foundProduct);
          setFormData({
            title: foundProduct.title,
            featuredImage: foundProduct.featuredImage,
            images: foundProduct.images.length > 0 ? foundProduct.images : [""],
            category: foundProduct.category,
            brand: foundProduct.brand,
            originalPrice: foundProduct.originalPrice,
            discountPrice: foundProduct.discountPrice || 0,
            sold: foundProduct.sold,
            totalStock: foundProduct.totalStock,
            rating: foundProduct.rating || 0,
            hasVariants: foundProduct.hasVariants,
            description: foundProduct.description || "",
            features:
              foundProduct.features.length > 0 ? foundProduct.features : [""],
            specifications: "",
            isFlashSale: foundProduct.isFlashSale,
            flashSaleEnd: foundProduct.flashSaleEnd
              ? new Date(foundProduct.flashSaleEnd).toISOString().slice(0, 16)
              : "",
          });

          // Transform specifications from database format to form format
          if (
            foundProduct.specifications &&
            Array.isArray(foundProduct.specifications) &&
            foundProduct.specifications.length > 0
          ) {
            // Transform from database format: [{name, specs: [{key, value}]}]
            // To form format: [{name, specs: {key: value}}]
            const transformedSpecs: SpecificationCategory[] =
              foundProduct.specifications.map(
                (category: SpecificationCategory) => {
                  const specsObject: { [key: string]: string } = {};

                  if (Array.isArray(category.specs)) {
                    category.specs.forEach(
                      (spec: { key: string; value: string }) => {
                        specsObject[spec.key] = spec.value;
                      }
                    );
                  }

                  return {
                    name: category.name,
                    specs: specsObject,
                  };
                }
              );

            setSpecifications(transformedSpecs);
          } else {
            // Set default if no specifications exist
            setSpecifications([
              {
                name: "Basic Information",
                specs: { Brand: "", Model: "", "Regular Price": "" },
              },
            ]);
          }

          setVariants(foundProduct.variants || []);
          setShowVariants(foundProduct.hasVariants);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProduct();
  }, [id]);

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
      {
        id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        color: "",
        price: 0,
        stock: 0,
        image: "",
        productId: product?.id || "",
      },
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

  // Update the handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!product) return;

    try {
      // Transform specifications back to database format (array of {key, value})
      const processedSpecifications = specifications.map((category) => ({
        name: category.name,
        specs: Object.entries(category.specs).map(([key, value]) => ({
          key,
          value,
        })),
      }));

      const updatedData = {
        ...formData,
        images: formData.images.filter((img) => img.trim() !== ""),
        features: formData.features.filter((feature) => feature.trim() !== ""),
        specifications: processedSpecifications,
        discountPrice: formData.discountPrice || undefined,
        rating: formData.rating || undefined,
        flashSaleEnd: formData.flashSaleEnd
          ? new Date(formData.flashSaleEnd)
          : undefined,
        hasVariants: showVariants,
        variants: showVariants ? variants : [],
      };

      await axios.patch(
        apiUrl(`/api/admin/products/${product.id}`),
        updatedData
      );
      router.push("/products");
    } catch (error) {
      console.error("Update error:", error);
      alert("Error updating product. Please check your input.");
    }
  };

  if (!product) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Product not found
          </h2>
          <p className="mt-2 text-gray-600">
            The product you are looking for doesnt exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Edit Product
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Update the product information. All fields marked with * are
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

                {/* Replace the old specifications section with the same dynamic section as in the add page */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Product Specifications
                  </label>
                  {specifications.map((category, categoryIndex) => (
                    <div
                      key={categoryIndex}
                      className="border border-gray-200 rounded-md p-4 mb-4"
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
                          placeholder="Category Name (e.g., Basic Information, Exterior)"
                          className="flex-1 focus:ring-blue-500 focus:border-blue-500 block shadow-sm sm:text-sm border-gray-300 rounded-md border px-3 py-2 font-medium"
                        />
                        {specifications.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              removeSpecificationCategory(categoryIndex)
                            }
                            className="ml-2 text-red-600 hover:text-red-800"
                          >
                            Remove Category
                          </button>
                        )}
                      </div>

                      <div className="space-y-2">
                        {Object.entries(category.specs).map(
                          ([key, value], specIndex) => (
                            <div
                              key={specIndex}
                              className="grid grid-cols-5 gap-2"
                            >
                              <input
                                type="text"
                                value={key}
                                onChange={(e) =>
                                  updateSpecificationKey(
                                    categoryIndex,
                                    key,
                                    e.target.value
                                  )
                                }
                                placeholder="Spec name (e.g., display, memory)"
                                className="col-span-2 focus:ring-blue-500 focus:border-blue-500 block shadow-sm sm:text-sm border-gray-300 rounded-md border px-3 py-2"
                              />
                              <input
                                type="text"
                                value={value}
                                onChange={(e) =>
                                  updateSpecificationValue(
                                    categoryIndex,
                                    key,
                                    e.target.value
                                  )
                                }
                                placeholder="Spec value"
                                className="col-span-2 focus:ring-blue-500 focus:border-blue-500 block shadow-sm sm:text-sm border-gray-300 rounded-md border px-3 py-2"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  removeSpecificationItem(categoryIndex, key)
                                }
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          )
                        )}
                        <button
                          type="button"
                          onClick={() => addSpecificationItem(categoryIndex)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          + Add Specification
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addSpecificationCategory}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    + Add Category
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
                          key={variant.id}
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
                  Update Product
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
