import { useSession } from 'next-auth/react'
import React, { useState, useCallback, FormEvent, ChangeEvent } from 'react'
import Image from 'next/image'
import { User } from '@prisma/client';
import useSWR from 'swr';

export type EditProfileFormData = {
  name?: string;
  image?: string;
  youtubeChannel?: string;
  discordId?: string;
  additionalNotes?: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function EditProfile() {
  const { data: session, update } = useSession();

  const { data: user, error: userError } = useSWR<User>(
    session?.user.id ? `/api/user/${session.user.id}` : null,
    fetcher
  );

  if (userError || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-lg">
          <h1 className="text-2xl font-bold text-center mb-4">Error</h1>
          <p className="text-red-600 text-center">{userError}</p>
        </div>
      </div>
    );
  }

  const [formData, setFormData] = useState<EditProfileFormData>({
    name: user.name,
    //image: user.image ?? undefined,
    youtubeChannel: user.youtubeChannel ?? undefined,
    discordId: user.discordId ?? undefined,
    additionalNotes: user.additionalNotes ?? undefined,
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const handleTextChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const formDataToSend = new FormData();

      // Append all text/number fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value)
          formDataToSend.append(key, String(value));
      });
      
      // Append files if they exist
      if (image) {
        formDataToSend.append('image', image);
      }
      
      console.log(formDataToSend);

      const response = await fetch('/api/user/update', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error(await response.text())
      }

      const result = await response.json()
      await update({
        name: formData.name,
        image: result.imageUrl || user.image
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            {previewImage ? (
              <Image
                src={previewImage}
                alt="Profile picture"
                width={96}
                height={96}
                className="rounded-full w-24 h-24 object-cover border-2 border-gray-200"
              />
            ) : (
              <img
                src={user.image ? `/${user.image}` :  '/DartMonkey.png'}
                alt="Profile picture"
                width={96}
                height={96}
                className="rounded-full w-24 h-24 object-cover border-2 border-gray-200"
              />
            )}
            
            <label className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-sm cursor-pointer">
              <input
                type="file"
                id="avatar"
                name="avatar"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </label>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleTextChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              YouTube Channel
            </label>
            <input
              type="text"
              id="youtubeChannel"
              name="youtubeChannel"
              value={formData.youtubeChannel}
              onChange={handleTextChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discord ID
            </label>
            <input
             type="text"
             id="discordId"
             name="discordId"
             value={formData.discordId}
             onChange={handleTextChange}
             className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            id="additionalNotes"
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={(e) => setFormData(prev => ({...prev, additionalNotes: e.target.value}))}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
          <p className="mt-1 text-sm text-gray-500 text-right">
            {formData.additionalNotes?.length ?? 0}/500
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}