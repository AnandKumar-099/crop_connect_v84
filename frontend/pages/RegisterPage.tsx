import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import { LightBulbIcon, UserCircleIcon } from '../components/icons';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('farmer');
  
  const [farmName, setFarmName] = useState('');
  const [farmAddress, setFarmAddress] = useState('');
  const [farmSize, setFarmSize] = useState('');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'farmer') {
        if (!farmName || !farmAddress || !farmSize) {
            setError('Please fill in all farm details.');
            return;
        }
    }
    setError('');
    setLoading(true);

    let profileImageUrl: string | undefined = undefined;
    if (role === 'farmer' && profileImageFile) {
        profileImageUrl = await fileToBase64(profileImageFile);
    }

    try {
      const user = await register({
        name, 
        email, 
        password, 
        role,
        phone,
        profileImageUrl,
        farmDetails: role === 'farmer' ? {
            farmName,
            address: farmAddress,
            sizeInAcres: parseFloat(farmSize)
        } : undefined
      });
      if (user.role === 'farmer') {
        navigate('/farmer/dashboard');
      } else {
        navigate('/buyer/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };
  
  const inputClasses = "relative block w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-shadow";


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
             <LightBulbIcon className="h-12 w-auto text-green-600 dark:text-green-400" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm text-center">{error}</div>}
          
          <div className="flex items-center justify-around p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <label className="flex items-center space-x-2 cursor-pointer px-4 py-2 rounded-md transition-all has-[:checked]:bg-white has-[:checked]:dark:bg-gray-700 has-[:checked]:shadow-sm">
              <input type="radio" name="role" value="farmer" checked={role === 'farmer'} onChange={() => setRole('farmer')} className="form-radio text-green-600 hidden" />
              <span className={`font-medium ${role === 'farmer' ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}`}>I am a Farmer</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer px-4 py-2 rounded-md transition-all has-[:checked]:bg-white has-[:checked]:dark:bg-gray-700 has-[:checked]:shadow-sm">
              <input type="radio" name="role" value="buyer" checked={role === 'buyer'} onChange={() => setRole('buyer')} className="form-radio text-green-600 hidden" />
              <span className={`font-medium ${role === 'buyer' ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}`}>I am a Buyer</span>
            </label>
          </div>

          <div className="space-y-4">
            <input name="name" type="text" required className={inputClasses} placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input name="email" type="email" autoComplete="email" required className={inputClasses} placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input name="phone" type="tel" autoComplete="tel" required className={inputClasses} placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input name="password" type="password" autoComplete="new-password" required className={inputClasses} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          {role === 'farmer' && (
            <div className="space-y-4 p-4 border dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-800">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-center mb-4">Farmer Details</h3>
                <div className="flex flex-col items-center space-y-2">
                    {profileImagePreview ? (
                        <img src={profileImagePreview} alt="Profile Preview" className="w-24 h-24 rounded-full object-cover ring-2 ring-green-500"/>
                    ) : (
                        <img src="/default-user.png" alt="Default User" className="w-24 h-24 rounded-full object-cover ring-2 ring-gray-300 dark:ring-gray-600"/>
                    )}
                     <label htmlFor="profile-image-upload" className="cursor-pointer bg-white dark:bg-gray-700 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                        Upload Photo
                    </label>
                    <input id="profile-image-upload" name="profileImage" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                </div>
                <input name="farmName" type="text" required={role === 'farmer'} className={inputClasses} placeholder="Farm Name" value={farmName} onChange={(e) => setFarmName(e.target.value)} />
                <input name="farmAddress" type="text" required={role === 'farmer'} className={inputClasses} placeholder="Farm Address" value={farmAddress} onChange={(e) => setFarmAddress(e.target.value)} />
                <input name="farmSize" type="number" required={role === 'farmer'} className={inputClasses} placeholder="Farm Size (in acres)" value={farmSize} onChange={(e) => setFarmSize(e.target.value)} />
            </div>
          )}

          <div>
            <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 dark:disabled:bg-green-800 transition-all">
              {loading ? 'Creating Account...' : 'Sign up'}
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
          <Link to="/login" className="font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 transition-colors">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;