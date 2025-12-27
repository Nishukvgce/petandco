
import React from 'react';
import { Menu, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminHeader = ({ user, onToggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    navigate('/admin-login');
  };

  return (
    <header className="bg-card border-b border-border h-16 flex items-center justify-between px-6 lg:pl-70">
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 hover:bg-muted rounded-lg"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-heading font-semibold text-foreground">
          PET&CO - Admin
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <User size={16} />
          <span>{user.name}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-3 py-2 text-sm bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
