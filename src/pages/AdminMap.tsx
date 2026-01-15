import AdminLayout from '@/components/admin/AdminLayout';
import EnhancedAdminMap from '@/components/admin/EnhancedAdminMap';

const AdminMap = () => {
  return (
    <AdminLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Enhanced Map View</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Interactive map with clustering, filters, and advanced features
          </p>
        </div>
        <EnhancedAdminMap />
      </div>
    </AdminLayout>
  );
};

export default AdminMap;
