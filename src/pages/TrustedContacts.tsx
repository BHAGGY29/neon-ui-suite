import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Phone, Edit, Trash2, Shield, AlertTriangle, Bell } from "lucide-react";
import BottomNav from "@/components/BottomNav";

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  priority: number;
  sosEnabled: boolean;
}

const initialContacts: Contact[] = [
  { id: "1", name: "Mom", phone: "+1 (555) 123-4567", email: "mom@email.com", priority: 1, sosEnabled: true },
  { id: "2", name: "Best Friend", phone: "+1 (555) 987-6543", email: "friend@email.com", priority: 2, sosEnabled: true },
  { id: "3", name: "Counselor", phone: "+1 (555) 456-7890", email: "help@counselor.com", priority: 3, sosEnabled: false },
];

const TrustedContacts = () => {
  const [contacts, setContacts] = useState(initialContacts);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", phone: "", email: "" });

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) return;
    
    const contact: Contact = {
      id: Date.now().toString(),
      name: newContact.name,
      phone: newContact.phone,
      email: newContact.email,
      priority: contacts.length + 1,
      sosEnabled: true,
    };
    
    setContacts([...contacts, contact]);
    setNewContact({ name: "", phone: "", email: "" });
    setShowAddForm(false);
  };

  const toggleSOS = (id: string) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, sosEnabled: !c.sosEnabled } : c))
    );
  };

  const deleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="min-h-screen pb-24 px-4 md:px-8 pt-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="w-6 h-6 text-neon-red animate-heartbeat" />
          <h1 className="heading-cyber text-3xl text-foreground">
            Trusted <span className="text-neon-red">Contacts</span>
          </h1>
        </div>
        <p className="text-muted-foreground">Emergency contacts for SOS alerts</p>
      </motion.div>

      {/* Warning Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto mb-8 p-4 rounded-xl bg-neon-red/10 border border-neon-red/30 flex items-start gap-3"
      >
        <AlertTriangle className="w-5 h-5 text-neon-red flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-foreground font-medium">Important Safety Feature</p>
          <p className="text-xs text-muted-foreground">
            These contacts will be notified during emergencies. Keep this list updated with people you trust.
          </p>
        </div>
      </motion.div>

      {/* Add Contact Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowAddForm(!showAddForm)}
        className="w-full max-w-xl mx-auto mb-6 p-4 rounded-xl border-2 border-dashed border-neon-cyan/50 flex items-center justify-center gap-2 text-neon-cyan hover:border-neon-cyan hover:bg-neon-cyan/10 transition-all"
      >
        <Plus className="w-5 h-5" />
        Add Trusted Contact
      </motion.button>

      {/* Add Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="max-w-xl mx-auto mb-6 glass-card p-6 space-y-4"
        >
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-neon-cyan" />
            New Contact
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Contact Name"
              value={newContact.name}
              onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              className="input-neon"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={newContact.phone}
              onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
              className="input-neon"
            />
            <input
              type="email"
              placeholder="Email (optional)"
              value={newContact.email}
              onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
              className="input-neon"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddForm(false)}
              className="flex-1 py-2 rounded-xl border border-border hover:bg-muted transition-colors text-muted-foreground"
            >
              Cancel
            </button>
            <button
              onClick={handleAddContact}
              className="flex-1 btn-neon py-2"
            >
              Add Contact
            </button>
          </div>
        </motion.div>
      )}

      {/* Contact List */}
      <div className="max-w-xl mx-auto space-y-3">
        {contacts.map((contact, index) => (
          <motion.div
            key={contact.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card-neon p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-red/30 to-neon-orange/30 flex items-center justify-center text-lg font-bold text-foreground">
                  {contact.priority}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{contact.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {contact.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* SOS Toggle */}
                <button
                  onClick={() => toggleSOS(contact.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    contact.sosEnabled
                      ? "bg-neon-red/20 text-neon-red"
                      : "bg-muted text-muted-foreground"
                  }`}
                  title={contact.sosEnabled ? "SOS Enabled" : "SOS Disabled"}
                >
                  <Bell className="w-4 h-4" />
                </button>

                <button
                  className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  onClick={() => deleteContact(contact.id)}
                  className="p-2 rounded-lg hover:bg-destructive/20 transition-colors text-destructive"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {contact.sosEnabled && (
              <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-xs text-neon-red">
                <Shield className="w-3 h-3" />
                SOS routing enabled - will receive emergency alerts
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {contacts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Shield className="w-16 h-16 text-neon-red/50 mx-auto mb-4" />
          <p className="text-muted-foreground">No trusted contacts yet. Add someone you trust.</p>
        </motion.div>
      )}

      <BottomNav />
    </div>
  );
};

export default TrustedContacts;
