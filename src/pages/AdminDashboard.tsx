import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import BottomNav from '@/components/BottomNav';
import { Shield, Users, MessageSquare, AlertTriangle, Bot, MapPin } from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalSOS: number;
  totalMessages: number;
  highRiskAlerts: number;
  totalCharacters: number;
  recentAlerts: Array<{
    id: string;
    risk_level: number;
    source_character: string | null;
    resolved: boolean;
    created_at: string;
    latitude: number | null;
    longitude: number | null;
  }>;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchStats();
  }, [user, navigate]);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-stats');
      
      if (error) {
        console.error('Error fetching stats:', error);
      } else {
        setStats(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { icon: Users, label: 'Total Users', value: stats?.totalUsers || 0, color: 'from-primary to-primary/50' },
    { icon: AlertTriangle, label: 'SOS Alerts', value: stats?.totalSOS || 0, color: 'from-destructive to-destructive/50' },
    { icon: MessageSquare, label: 'Messages', value: stats?.totalMessages || 0, color: 'from-secondary to-secondary/50' },
    { icon: Shield, label: 'High Risk', value: stats?.highRiskAlerts || 0, color: 'from-accent to-accent/50' },
    { icon: Bot, label: 'Characters', value: stats?.totalCharacters || 0, color: 'from-primary to-secondary' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-card/80 to-background border-b border-border/50 p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm">System Overview & Analytics</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-4 grid grid-cols-2 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5 text-primary-foreground" />
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Alerts */}
      <div className="p-4">
        <h2 className="font-display text-lg font-bold text-foreground mb-4">Recent Alerts</h2>
        <div className="space-y-3">
          {stats?.recentAlerts?.length ? (
            stats.recentAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-card/50 backdrop-blur-sm border rounded-xl p-4 ${
                  alert.risk_level >= 8 
                    ? 'border-destructive/50 bg-destructive/5' 
                    : 'border-border/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      alert.resolved ? 'bg-green-500' : 'bg-destructive animate-pulse'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Risk Level: {alert.risk_level}/10
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {alert.source_character || 'Unknown Character'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {new Date(alert.created_at).toLocaleDateString()}
                    </p>
                    {alert.latitude && alert.longitude && (
                      <div className="flex items-center gap-1 text-xs text-primary">
                        <MapPin className="w-3 h-3" />
                        Location
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No alerts yet
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default AdminDashboard;
