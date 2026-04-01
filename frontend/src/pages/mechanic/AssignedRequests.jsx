import React, { useState, useEffect, useCallback } from 'react';
import { 
  ClockIcon, 
  MapPinIcon, 
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftIcon,
  ArrowTopRightOnSquareIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/common/Button';
import NavigationModal from '../../components/mechanic/NavigationModal';
import requestService from '../../services/requestService';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import RequestDetailsModal from '../../components/mechanic/RequestDetailsModal';
const AssignedRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [acceptFormData, setAcceptFormData] = useState({
    estimatedArrival: 30,
    quotation: ''
  });
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10
  });

  const fetchAssignedRequests = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = {
        page: pagination.currentPage,
        limit: pagination.limit,
        includeAvailable: true, // Include available broadcast requests
        ...filters
      };

      Object.keys(queryParams).forEach(key => {
        if (!queryParams[key]) {
          delete queryParams[key];
        }
      });

      const response = await requestService.getAssignedRequests(queryParams);
      
      if (response.success) {
        setRequests(response.data.requests || []);
        setPagination(prev => ({
          ...prev,
          totalPages: response.data.pagination?.totalPages || 1,
          totalItems: response.data.pagination?.totalItems || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching assigned requests:', error);
      toast.error('Failed to load assigned requests');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage, pagination.limit]);

  useEffect(() => {
    fetchAssignedRequests();
  }, [fetchAssignedRequests]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      const response = await requestService.updateRequestStatus(requestId, newStatus);
      
      if (response.success) {
        toast.success(`Request ${newStatus} successfully`);
        fetchAssignedRequests(); // Refresh the list
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to update request status';
      toast.error(errorMessage);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await requestService.acceptRequest(requestId, acceptFormData);
      
      if (response.success) {
        toast.success('Request accepted successfully');
        setShowAcceptModal(false);
        setSelectedRequest(null);
        setAcceptFormData({ estimatedArrival: 30, quotation: '' });
        fetchAssignedRequests(); // Refresh the list
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to accept request';
      toast.error(errorMessage);
    }
  };

  const handleRejectRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to reject this request?')) {
      return;
    }

    try {
      const response = await requestService.rejectRequest(requestId, {
        reason: 'Mechanic rejected the request'
      });
      
      if (response.success) {
        toast.success('Request rejected successfully');
        fetchAssignedRequests(); // Refresh the list
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to reject request';
      toast.error(errorMessage);
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const openAcceptModal = (request) => {
    setSelectedRequest(request);
    setShowAcceptModal(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-warning-500" />;
      case 'assigned':
      case 'enroute':
      case 'in_progress':
        return <WrenchScrewdriverIcon className="h-5 w-5 text-primary-500" />;
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-success-500" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-danger-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-secondary-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'enroute':
        return 'bg-purple-100 text-purple-800';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-secondary-900">Service Requests</h1>
            <div className="flex gap-4">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Requests</option>
                <option value="pending">Available & Pending</option>
                <option value="assigned">Assigned</option>
                <option value="enroute">En Route</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <input
                type="text"
                placeholder="Search requests..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-12">
              <ClockIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No requests available</h3>
              <p className="text-gray-500">You don't have any assigned service requests or available broadcast requests at the moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          {request.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">#{request._id.slice(-8)}</span>
                        {request.mechanicId && (request.status === 'pending' || request.status === 'assigned') && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Direct Booking
                          </span>
                        )}
                        {!request.mechanicId && request.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Available
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {request.issueType.replace('_', ' ').toUpperCase()}
                      </h3>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">{request.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPinIcon className="w-4 h-4" />
                          <span>{request.location.address || 'Location not specified'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          <span>{formatDate(request.createdAt)}</span>
                        </div>
                        {request.userExpectedPrice > 0 && (
                          <div className="font-medium text-primary-600">
                             Expected: ₹{request.userExpectedPrice}
                          </div>
                        )}
                        {request.quotation && (
                          <div className="font-medium text-green-600 ml-auto">
                            Offer: ₹{request.quotation}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(request)}
                      >
                        View Details
                      </Button>
                      
                      {/* Chat button for assigned requests */}
                      {request.status !== 'pending' && request.customerId && (
                        <Link to={`/mechanic/chat?requestId=${request._id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <ChatBubbleLeftIcon className="w-4 h-4" />
                            Chat
                          </Button>
                        </Link>
                      )}
                      
                      {request.status === 'pending' && request.mechanicId && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => openAcceptModal(request)}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRejectRequest(request._id)}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      
                      {request.status === 'pending' && !request.mechanicId && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => openAcceptModal(request)}
                        >
                          Accept Request
                        </Button>
                      )}
                      
                      {request.status === 'pending' && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setAcceptFormData(prev => ({ ...prev, quotation: request.basePrice || 1500 }));
                            setShowAcceptModal(true);
                          }}
                        >
                          Accept & Offer
                        </Button>
                      )}
                      
                      {request.status === 'offered' && (
                         <span className="text-xs text-secondary-500 italic">Waiting for customer confirmation</span>
                      )}

                      {request.status === 'assigned' && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleStatusUpdate(request._id, 'enroute')}
                          >
                            Start Journey
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowNavigationModal(true);
                            }}
                            icon={<ArrowTopRightOnSquareIcon className="h-4 w-4" />}
                          >
                            Navigate
                          </Button>
                        </>
                      )}
                      
                      {request.status === 'enroute' && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleStatusUpdate(request._id, 'in_progress')}
                          >
                            Start Work
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowNavigationModal(true);
                            }}
                            icon={<ArrowTopRightOnSquareIcon className="h-4 w-4" />}
                          >
                            Navigate
                          </Button>
                        </>
                      )}
                      
                      {request.status === 'in_progress' && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleStatusUpdate(request._id, 'completed')}
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Accept Request Modal */}
      {showAcceptModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Accept Service Request</h3>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Customer Details:</h4>
                <div className="bg-gray-50 p-3 rounded">
                  <p><strong>Name:</strong> {selectedRequest.customerId?.name || 'N/A'}</p>
                  <p><strong>Phone:</strong> {selectedRequest.customerId?.phone || 'N/A'}</p>
                  <p><strong>Email:</strong> {selectedRequest.customerId?.email || 'N/A'}</p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Service Location:</h4>
                <div className="bg-gray-50 p-3 rounded">
                  <p>{selectedRequest.location.address || 'Address not specified'}</p>
                  <p className="text-sm text-gray-500">
                    {selectedRequest.location.lat}, {selectedRequest.location.lng}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Service Details:</h4>
                <div className="bg-gray-50 p-3 rounded">
                  <p><strong>Issue:</strong> {selectedRequest.issueType.replace('_', ' ').toUpperCase()}</p>
                  <p><strong>Vehicle:</strong> {selectedRequest.vehicleInfo.type} - {selectedRequest.vehicleInfo.model}</p>
                  <p><strong>Plate:</strong> {selectedRequest.vehicleInfo.plate}</p>
                  <p><strong>Description:</strong> {selectedRequest.description}</p>
                  <p><strong>User Expected Price:</strong> ₹{selectedRequest.userExpectedPrice || 'N/A'}</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Arrival Time (minutes)
                </label>
                <input
                  type="number"
                  value={acceptFormData.estimatedArrival}
                  onChange={(e) => setAcceptFormData(prev => ({ ...prev, estimatedArrival: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min="5"
                  max="180"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quotation (₹)
                </label>
                <input
                  type="number"
                  value={acceptFormData.quotation}
                  onChange={(e) => setAcceptFormData(prev => ({ ...prev, quotation: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter quotation amount"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAcceptModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleAcceptRequest(selectedRequest._id)}
                >
                  Accept Request
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Details Modal */}
      {showDetailsModal && selectedRequest && (
        <RequestDetailsModal
          request={selectedRequest}
          onClose={() => setShowDetailsModal(false)}
          onStatusUpdate={handleStatusUpdate}
          onNavigate={(request) => {
            setSelectedRequest(request);
            setShowDetailsModal(false);
            setShowNavigationModal(true);
          }}
        />
      )}

      {/* Navigation Modal */}
      <NavigationModal
        isOpen={showNavigationModal}
        onClose={() => setShowNavigationModal(false)}
        request={selectedRequest}
        mechanicLocation={user?.location}
      />
    </>
  );
};

export default AssignedRequests;