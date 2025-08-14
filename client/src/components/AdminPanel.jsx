import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye, Check, X, User, Building, FileText, Phone, Mail, MapPin, Calendar, DollarSign } from 'lucide-react';

const AdminPanel = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('pending');
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // Fetch seller applications from backend
  useEffect(() => {
    fetchApplications();
  }, [activeTab]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/seller-applications?status=${activeTab}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setApplications(data.data.applications);
      } else {
        console.error('Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  // View application details in modal
  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setShowApplicationModal(true);
  };

  // Approve seller application and create account
  const handleApproveApplication = async (applicationId) => {
    if (!window.confirm('Are you sure you want to approve this seller application?')) {
      return;
    }

    setProcessingId(applicationId);
    try {
      const response = await fetch(`/api/admin/seller-applications/${applicationId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Seller approved successfully! Login credentials sent to ${data.data.email}`);
        fetchApplications(); // Refresh the list
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error approving application:', error);
      alert('Error approving application');
    } finally {
      setProcessingId(null);
    }
  };

  // Reject seller application
  const handleRejectApplication = async (applicationId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    setProcessingId(applicationId);
    try {
      const response = await fetch(`/api/admin/seller-applications/${applicationId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Seller application rejected successfully!');
        fetchApplications(); // Refresh the list
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Error rejecting application');
    } finally {
      setProcessingId(null);
    }
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4C4C] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-[#FF4C4C] transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel - Seller Applications</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'pending', label: 'Pending Applications', count: applications.filter(app => app.status === 'pending').length },
              { id: 'approved', label: 'Approved Applications', count: applications.filter(app => app.status === 'approved').length },
              { id: 'rejected', label: 'Rejected Applications', count: applications.filter(app => app.status === 'rejected').length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#FF4C4C] text-[#FF4C4C]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No {activeTab} applications found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Person
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((application) => (
                    <tr key={application._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {application.companyName}
                          </div>
                          <div className="text-sm text-gray-500">
                            GST: {application.gstNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {application.contactPerson}
                          </div>
                          <div className="text-sm text-gray-500">
                            {application.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {application.businessCategory}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(application.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(application.status)}`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewApplication(application)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {application.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApproveApplication(application._id)}
                                disabled={processingId === application._id}
                                className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleRejectApplication(application._id)}
                                disabled={processingId === application._id}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Application Details Modal */}
      {showApplicationModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Seller Application Details
                </h3>
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Company Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Company Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Company Name:</span> {selectedApplication.companyName}
                  </div>
                  <div>
                    <span className="font-medium">Company Type:</span> {selectedApplication.companyType}
                  </div>
                  <div>
                    <span className="font-medium">Registration Number:</span> {selectedApplication.registrationNumber}
                  </div>
                  <div>
                    <span className="font-medium">GST Number:</span> {selectedApplication.gstNumber}
                  </div>
                  <div>
                    <span className="font-medium">PAN Number:</span> {selectedApplication.panNumber}
                  </div>
                  <div>
                    <span className="font-medium">Established Year:</span> {selectedApplication.establishedYear}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Contact Person:</span> {selectedApplication.contactPerson}
                  </div>
                  <div>
                    <span className="font-medium">Designation:</span> {selectedApplication.designation}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {selectedApplication.email}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {selectedApplication.phone}
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address Information
                </h4>
                <div className="text-sm">
                  <p>{selectedApplication.address}</p>
                  <p>{selectedApplication.city}, {selectedApplication.state} - {selectedApplication.pincode}</p>
                  <p>{selectedApplication.country}</p>
                </div>
              </div>

              {/* Business Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Business Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Business Category:</span> {selectedApplication.businessCategory}
                  </div>
                  <div>
                    <span className="font-medium">Manufacturing Capacity:</span> {selectedApplication.manufacturingCapacity || 'Not specified'}
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium">Product Categories:</span> {selectedApplication.productCategories?.join(', ')}
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium">Warehouse Location:</span> {selectedApplication.warehouseLocation || 'Not specified'}
                  </div>
                </div>
              </div>

              {/* Banking Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Banking Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Bank Name:</span> {selectedApplication.bankName}
                  </div>
                  <div>
                    <span className="font-medium">Account Holder:</span> {selectedApplication.accountHolderName}
                  </div>
                  <div>
                    <span className="font-medium">Account Number:</span> {selectedApplication.accountNumber}
                  </div>
                  <div>
                    <span className="font-medium">IFSC Code:</span> {selectedApplication.ifscCode}
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Uploaded Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedApplication.documents?.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                      <span className="text-sm">{doc.name}</span>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              {selectedApplication.status === 'pending' && (
                <div className="flex justify-end gap-4 pt-4 border-t">
                  <button
                    onClick={() => {
                      handleRejectApplication(selectedApplication._id);
                      setShowApplicationModal(false);
                    }}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reject Application
                  </button>
                  <button
                    onClick={() => {
                      handleApproveApplication(selectedApplication._id);
                      setShowApplicationModal(false);
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Approve & Create Account
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;