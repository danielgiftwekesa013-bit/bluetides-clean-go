import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Gift,
  Loader2,
  ArrowLeft,
  Droplets,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Profile: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState<any>(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');

  // -----------------------------------
  // Fetch profile
  // -----------------------------------
  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from('users')
        .select('full_name, email, phone, location, referral_code')
        .eq('id', user.id)
        .single();

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to load profile',
          variant: 'destructive',
        });
        return;
      }

      setProfile(data);
      setFullName(data.full_name ?? '');
      setPhone(data.phone ?? '');
      setLocation(data.location ?? '');
      setLoading(false);
    };

    fetchProfile();
  }, [toast]);

  // -----------------------------------
  // Save updates
  // -----------------------------------
  const handleSave = async () => {
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from('users')
      .update({
        full_name: fullName,
        phone,
        location,
      })
      .eq('id', user.id);

    setSaving(false);

    if (error) {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Profile updated ✅',
      description: 'Your changes have been saved',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="container max-w-xl mx-auto px-4 py-6"
    >
      {/* Top Bar */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/dashboard')}
          className="rounded-full"
        >
          <ArrowLeft />
        </Button>

        <div className="flex items-center gap-2">
          <Droplets className="text-primary animate-pulse" />
          <h1 className="text-2xl font-bold">My Profile</h1>
        </div>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ scale: 0.96 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4 }}
      >
       <Card className="shadow-soft rounded-2xl p-6 bg-gradient-to-br from-blue-600 to-sky-500 backdrop-blur-sm">
          <CardContent className="space-y-5 p-6">

            {/* Full Name */}
            <div className="flex items-center gap-3">
              <User className="text-primary w-5 h-5" />
              <Input
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Full name"
              />
            </div>

            {/* Email (read-only) */}
            <div className="flex items-center gap-3 opacity-70">
              <Mail className="text-blue-500 w-5 h-5" />
              <Input value={profile.email} disabled />
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3">
              <Phone className="text-green-500 w-5 h-5" />
              <Input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Phone number"
              />
            </div>

            {/* Location */}
            <div className="flex items-center gap-3">
              <MapPin className="text-orange-500 w-5 h-5" />
              <Input
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Location"
              />
            </div>

            {/* Referral Code */}
            <div className="flex items-center gap-3 opacity-70">
              <Gift className="text-purple-500 w-5 h-5" />
              <Input value={profile.referral_code} disabled />
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full mt-4"
            >
              {saving ? (
                <Loader2 className="animate-spin" />
              ) : (
                'Save Changes'
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Profile;
