// SellerRegistration.jsx
import React, { useState } from 'react';
import { ArrowLeft, Upload } from 'lucide-react';

// Main Seller Registration Component
const SellerRegistration = ({ onBack }) => {
  // Track which step of the form user is on
  const [currentStep, setCurrentStep] = useState(1);

  // Store form data
  const [formData, setFormData] = useState({
    // Step 1: Company Info
    companyName: '',
    companyType: '',
    registrationNumber: '',
    gstNumber: '',
    panNumber: '',
    establishedYear: '',

    // Step 2: Contact Info
    contactPerson: '',
    designation: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',

    // Step 3: Business Info
    businessCategory: '',
    manufacturingCapacity: '',
    warehouseLocation: '',
    productCategories: [],

    // Step 4: Banking
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',

    // Step 5: Document Uploads
    documents: {
      gstCertificate: null,
      panCard: null,
      companyRegistration: null,
      bankStatement: null,
      productCatalog: null
    }
  });

  // New state for error handling
  const [fieldErrors, setFieldErrors] = useState({}); // specific field errors from backend
  const [generalError, setGeneralError] = useState(''); // top-level API errors
  const [isSubmitting, setIsSubmitting] = useState(false); // loading state
  const [isSubmitted, setIsSubmitted] = useState(false); // show success screen
  const [applicationId, setApplicationId] = useState(null); // store application ID from backend

  // Static dropdowns
  const companyTypes = [
    'Private Limited Company',
    'Public Limited Company',
    'Partnership',
    'Sole Proprietorship',
    'LLP',
    'Other'
  ];

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands',
    'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
    'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ];

  const businessCategories = [
    'Manufacturer',
    'Wholesaler',
    'Distributor',
    'Retailer',
    'Exporter',
    'Importer'
  ];

  const productCategories = [
    'Electronics',
    'Furniture',
    'Clothing',
    'Food & Beverages',
    'Automobiles',
    'Stationery',
    'Home Appliances',
    'Toys & Games',
    'Sports Equipment',
    'Beauty & Personal Care'
  ];

  // Toggle product category in array
  const handleProductCategoryToggle = (category) => {
    setFormData((prev) => ({
      ...prev,
      productCategories: prev.productCategories.includes(category)
        ? prev.productCategories.filter((c) => c !== category)
        : [...prev.productCategories, category]
    }));
  };

  // Handle file uploads
  const handleFileUpload = (key, file) => {
    setFormData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [key]: file
      }
    }));
  };

  

  // Navigation
  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Submit handler with backend error handling
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setGeneralError('');
    setFieldErrors({});

    try {
      // Prepare form data
      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === 'documents') {
          Object.keys(formData.documents).forEach((docKey) => {
            if (formData.documents[docKey]) {
              payload.append(docKey, formData.documents[docKey]);
            }
          });
        } else if (Array.isArray(formData[key])) {
          payload.append(key, JSON.stringify(formData[key]));
        } else {
          payload.append(key, formData[key]);
        }
      });

      const res = await fetch('/api/seller/register', {
        method: 'POST',
        body: payload
      });

      const data = await res.json();

      if (!res.ok) {
        // If backend returns field-specific errors
        if (data.errors) {
          setFieldErrors(data.errors);
        }
        // If backend returns a general error message
        if (data.message) {
          setGeneralError(data.message);
        }
        setIsSubmitting(false);
        return;
      }

      // Success
      setApplicationId(data.applicationId || null);
      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
      setGeneralError('Something went wrong. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Steps for progress bar
  const steps = [
    { id: 1, title: 'Company Information', description: 'Enter your company details' },
    { id: 2, title: 'Contact & Address', description: 'Provide contact and address information' },
    { id: 3, title: 'Business Information', description: 'Share business category and products' },
    { id: 4, title: 'Banking Details', description: 'Provide your banking information' },
    { id: 5, title: 'Document Upload', description: 'Upload necessary documents' },
    { id: 6, title: 'Review & Submit', description: 'Confirm and submit your application' }
  ];

  // Render step content
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C]"
                  placeholder="Enter company name"
                  required
                />
                {fieldErrors.companyName && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.companyName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Type *
                </label>
                <select
                  value={formData.companyType}
                  onChange={(e) => setFormData({ ...formData, companyType: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C]"
                  required
                >
                  <option value="">Select company type</option>
                  {companyTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {fieldErrors.companyType && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.companyType}</p>
                )}
              </div>
                            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Number *
                </label>
                <input
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C]"
                  placeholder="Enter registration number"
                  required
                />
                {fieldErrors.registrationNumber && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.registrationNumber}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GST Number *
                </label>
                <input
                  type="text"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C]"
                  placeholder="Enter GST number"
                  required
                />
                {fieldErrors.gstNumber && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.gstNumber}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PAN Number *
                </label>
                <input
                  type="text"
                  value={formData.panNumber}
                  onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C]"
                  placeholder="Enter PAN number"
                  required
                />
                {fieldErrors.panNumber && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.panNumber}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Established Year
                </label>
                <input
                  type="number"
                  value={formData.establishedYear}
                  onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C]"
                  placeholder="YYYY"
                />
                {fieldErrors.establishedYear && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.establishedYear}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Contact & Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person *
                </label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C]"
                  placeholder="Enter contact person name"
                  required
                />
                {fieldErrors.contactPerson && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.contactPerson}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Designation
                </label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C]"
                  placeholder="Enter designation"
                />
                {fieldErrors.designation && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.designation}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C]"
                  placeholder="Enter email"
                  required
                />
                {fieldErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C]"
                  placeholder="Enter phone number"
                  required
                />
                {fieldErrors.phone && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.phone}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C]"
                  placeholder="Enter address"
                  rows={2}
                />
                {fieldErrors.address && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.address}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C]"
                  placeholder="Enter city"
                />
                {fieldErrors.city && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.city}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C]"
                >
                  <option value="">Select state</option>
                  {indianStates.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {fieldErrors.state && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.state}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode
                </label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C]"
                  placeholder="Enter pincode"
                />
                {fieldErrors.pincode && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.pincode}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Business Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Category
                </label>
                <select
                  value={formData.businessCategory}
                  onChange={(e) => setFormData({ ...formData, businessCategory: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C]"
                >
                  <option value="">Select category</option>
                  {businessCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {fieldErrors.businessCategory && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.businessCategory}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manufacturing Capacity
                </label>
                <input
                  type="text"
                  value={formData.manufacturingCapacity}
                  onChange={(e) => setFormData({ ...formData, manufacturingCapacity: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C]"
                  placeholder="Units per month"
                />
                {fieldErrors.manufacturingCapacity && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.manufacturingCapacity}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warehouse Location
                </label>
                <input
                  type="text"
                  value={formData.warehouseLocation}
                  onChange={(e) => setFormData({ ...formData, warehouseLocation: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C]"
                  placeholder="Enter warehouse location"
                />
                {fieldErrors.warehouseLocation && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.warehouseLocation}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Categories
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {productCategories.map((category) => (
                    <label key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.productCategories.includes(category)}
                        onChange={() => handleProductCategoryToggle(category)}
                        className="h-4 w-4 text-[#FF4C4C] focus:ring-[#FF4C4C] border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
                {fieldErrors.productCategories && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.productCategories}</p>
                )}
              </div>
            </div>
          </div>
        );
              case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Banking Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name *
                </label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C]"
                  placeholder="Enter bank name"
                  required
                />
                {fieldErrors.bankName && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.bankName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Holder Name *
                </label>
                <input
                  type="text"
                  value={formData.accountHolderName}
                  onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C]"
                  placeholder="Enter account holder name"
                  required
                />
                {fieldErrors.accountHolderName && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.accountHolderName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number *
                </label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C]"
                  placeholder="Enter account number"
                  required
                />
                {fieldErrors.accountNumber && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.accountNumber}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IFSC Code *
                </label>
                <input
                  type="text"
                  value={formData.ifscCode}
                  onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4C4C]"
                  placeholder="Enter IFSC code (11 characters)"
                  pattern="[A-Z]{4}0[A-Z0-9]{6}"
                  required
                />
                {fieldErrors.ifscCode && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors.ifscCode}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Document Upload</h3>
            <p className="text-gray-600">Please upload the following documents (PDF/Image format, max 5MB each):</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { key: 'gstCertificate', label: 'GST Certificate', required: true },
                { key: 'panCard', label: 'PAN Card', required: true },
                { key: 'companyRegistration', label: 'Company Registration Certificate', required: true },
                { key: 'bankStatement', label: 'Bank Statement (Last 3 months)', required: true },
                { key: 'productCatalog', label: 'Product Catalog', required: false }
              ].map((doc) => (
                <div
                  key={doc.key}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#FF4C4C] transition-colors"
                >
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    {doc.label} {doc.required && '*'}
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(doc.key, file);
                    }}
                    className="hidden"
                    id={doc.key}
                  />
                  <label
                    htmlFor={doc.key}
                    className="cursor-pointer text-[#FF4C4C] hover:text-[#FF4C4C]/80 text-sm"
                  >
                    Click to upload
                  </label>
                  {formData.documents[doc.key] && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ {formData.documents[doc.key]?.name}
                    </p>
                  )}
                  {fieldErrors[doc.key] && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors[doc.key]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Review & Submit</h3>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">Company Information</h4>
                <p className="text-sm text-gray-600">
                  {formData.companyName} • {formData.companyType} • GST: {formData.gstNumber}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Contact Details</h4>
                <p className="text-sm text-gray-600">
                  {formData.contactPerson} • {formData.email} • {formData.phone}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Business Category</h4>
                <p className="text-sm text-gray-600">{formData.businessCategory}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Product Categories</h4>
                <p className="text-sm text-gray-600">{formData.productCategories.join(', ')}</p>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Admin will review your application within 2-3 business days</li>
                <li>• Our team may contact you for additional information</li>
                <li>• Once approved, you'll receive login credentials via email</li>
                <li>• You can then start listing your products on the platform</li>
              </ul>
            </div>

            {fieldErrors.general && (
              <p className="text-red-500 text-sm mt-4">{fieldErrors.general}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-[#FF4C4C] transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900">Seller Registration</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.id
                      ? 'bg-[#FF4C4C] border-[#FF4C4C] text-white'
                      : 'border-gray-300 text-gray-500'
                  }`}
                >
                  {step.id}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-full h-0.5 mx-4 ${
                      currentStep > step.id ? 'bg-[#FF4C4C]' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-sm text-gray-600">
              {steps[currentStep - 1].description}
            </p>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">{renderStep()}</div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Previous
          </button>

          {currentStep < steps.length ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-[#FF4C4C] text-white rounded-lg font-medium hover:bg-[#FF4C4C]/90 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                isSubmitting
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerRegistration;

