import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import BottomNav from '@/components/BottomNav';
import { Settings as SettingsIcon, Bell, MapPin, Phone, Moon, LogOut, Shield, User } from 'lucide-react';

interface UserSettings {
  notifications_enabled: boolean;
  sos_auto_call: boolean;
  location_sharing: boolean;
  dark_mode: boolean;
}

const Settings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings>({
    notifications_enabled: true,
    sos_auto_call: true,
    location_sharing: true,
    dark_mode: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchSettings();
  }, [user, navigate]);

  const fetchSettings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setSettings({
        notifications_enabled: data.notifications_enabled,
        sos_auto_call: data.sos_auto_call,
        location_sharing: data.location_sharing,
        dark_mode: data.dark_mode,
      });
    }
    setLoading(false);
  };

  const updateSetting = async (key: keyof UserSettings, value: boolean) => {
    if (!user) return;

    setSettings((prev) => ({ ...prev, [key]: value }));

    const { error } = await supabase
      .from('user_settings')
      .update({ [key]: value })
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update setting.',
        variant: 'destructive',
      });
      setSettings((prev) => ({ ...prev, [key]: !value }));
    } else {
      toast({
        title: 'Settings Updated',
        description: 'Your preference has been saved.',
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const settingsItems = [
    {
      icon: Bell,
      label: 'Push Notifications',
      description: 'Receive alerts and updates',
      key: 'notifications_enabled' as keyof UserSettings,
    },
    {
      icon: Phone,
      label: 'Auto SOS Call',
      description: 'Automatically call emergency contacts',
      key: 'sos_auto_call' as keyof UserSettings,
    },
    {
      icon: MapPin,
      label: 'Location Sharing',
      description: 'Share location during SOS',
      key: 'location_sharing' as keyof UserSettings,
    },
    {
      icon: Moon,
      label: 'Dark Mode',
      description: 'Use dark theme',
      key: 'dark_mode' as keyof UserSettings,
    },
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground text-sm">Manage your preferences</p>
          </div>
        </div>
      </div>

      {/* Settings List */}
      <div className="p-4 space-y-4">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">Account</span>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Email: {user?.email}</p>
          </div>
        </motion.div>

        {/* Safety Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-secondary" />
            <span className="font-semibold text-foreground">Safety & Privacy</span>
          </div>
          <div className="space-y-4">
            {settingsItems.map((item, index) => (
              <div key={item.key} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <Label className="text-foreground">{item.label}</Label>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <Switch
                  checked={settings[item.key]}
                  onCheckedChange={(value) => updateSetting(item.key, value)}
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sign Out */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </Button>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Settings;
