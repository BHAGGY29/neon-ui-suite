import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Users, Plus, Phone, Edit, Trash2, Shield, AlertTriangle, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";

interface Contact {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  priority: number;
  sos_enabled: boolean;
}

const TrustedContacts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", phone: "", email: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchContacts();
  }, [user, navigate]);

  const fetchContacts = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('trusted_contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('priority', { ascending: true });

    if (data) setContacts(data);
    setLoading(false);
  };

  const handleAddContact = async () => {
    if (!newContact.name || !user) return;
    
    const { data, error } = await supabase
      .from('trusted_contacts')
      .insert({
        user_id: user.id,
        name: newContact.name,
        phone: newContact.phone || null,
        email: newContact.email || null,
        priority: contacts.length + 1,
        sos_enabled: true,
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: 'Failed to add contact.', variant: 'destructive' });
    } else if (data) {
      setContacts([...contacts, data]);
      setNewContact({ name: "", phone: "", email: "" });
      setShowAddForm(false);
      toast({ title: 'Contact Added', description: `${data.name} has been added.` });
    }
  };

  const toggleSOS = async (id: string, currentValue: boolean) => {
    const { error } = await supabase
      .from('trusted_contacts')
      .update({ sos_enabled: !currentValue })
      .eq('id', id);

    if (!error) {
      setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, sos_enabled: !currentValue } : c)));
    }
  };

  const deleteContact = async (id: string) => {
    const { error } = await supabase.from('trusted_contacts').delete().eq('id', id);
    if (!error) {
      setContacts((prev) => prev.filter((c) => c.id !== id));
      toast({ title: 'Contact Removed' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 px-4 md:px-8 pt-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="w-6 h-6 text-neon-red animate-heartbeat" />
          <h1 className="heading-cyber text-3xl text-foreground">Trusted <span className="text-neon-red">Contacts</span></h1>
        </div>
        <p className="text-muted-foreground">Emergency contacts for SOS alerts</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl mx-auto mb-8 p-4 rounded-xl bg-neon-red/10 border border-neon-red/30 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-neon-red flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-foreground font-medium">Important Safety Feature</p>
          <p className="text-xs text-muted-foreground">These contacts will be notified during emergencies.</p>
        </div>
      </motion.div>

      <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowAddForm(!showAddForm)} className="w-full max-w-xl mx-auto mb-6 p-4 rounded-xl border-2 border-dashed border-neon-cyan/50 flex items-center justify-center gap-2 text-neon-cyan hover:border-neon-cyan hover:bg-neon-cyan/10 transition-all">
        <Plus className="w-5 h-5" />Add Trusted Contact
      </motion.button>

      {showAddForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="max-w-xl mx-auto mb-6 glass-card p-6 space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2"><Users className="w-5 h-5 text-neon-cyan" />New Contact</h3>
          <div className="space-y-3">
            <input type="text" placeholder="Contact Name" value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} className="input-neon" />
            <input type="tel" placeholder="Phone Number" value={newContact.phone} onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} className="input-neon" />
            <input type="email" placeholder="Email (optional)" value={newContact.email} onChange={(e) => setNewContact({ ...newContact, email: e.target.value })} className="input-neon" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowAddForm(false)} className="flex-1 py-2 rounded-xl border border-border hover:bg-muted transition-colors text-muted-foreground">Cancel</button>
            <button onClick={handleAddContact} className="flex-1 btn-neon py-2">Add Contact</button>
          </div>
        </motion.div>
      )}

      <div className="max-w-xl mx-auto space-y-3">
        {contacts.map((contact, index) => (
          <motion.div key={contact.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="card-neon p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-red/30 to-neon-orange/30 flex items-center justify-center text-lg font-bold text-foreground">{contact.priority}</div>
                <div>
                  <h3 className="font-semibold text-foreground">{contact.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{contact.phone || 'No phone'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleSOS(contact.id, contact.sos_enabled)} className={`p-2 rounded-lg transition-colors ${contact.sos_enabled ? "bg-neon-red/20 text-neon-red" : "bg-muted text-muted-foreground"}`}><Bell className="w-4 h-4" /></button>
                <button onClick={() => deleteContact(contact.id)} className="p-2 rounded-lg hover:bg-destructive/20 transition-colors text-destructive"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            {contact.sos_enabled && (<div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-xs text-neon-red"><Shield className="w-3 h-3" />SOS routing enabled</div>)}
          </motion.div>
        ))}
      </div>

      {contacts.length === 0 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16"><Shield className="w-16 h-16 text-neon-red/50 mx-auto mb-4" /><p className="text-muted-foreground">No trusted contacts yet. Add someone you trust.</p></motion.div>)}

      <BottomNav />
    </div>
  );
};

export default TrustedContacts;
