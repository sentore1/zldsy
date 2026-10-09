import { MessageCircle, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { copyToClipboard } from '@/lib/utils/whatsapp';

interface WhatsAppShareButtonProps {
  onClick: () => void;
  message?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showCopyOption?: boolean;
  className?: string;
}

export function WhatsAppShareButton({
  onClick,
  message,
  variant = 'primary',
  size = 'md',
  showCopyOption = false,
  className = '',
}: WhatsAppShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleCopy = async () => {
    if (message) {
      const success = await copyToClipboard(message);
      if (success) {
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
          setShowMenu(false);
        }, 2000);
      }
    }
  };

  const baseClasses = 'inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-200';
  
  const variantClasses = {
    primary: 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    outline: 'border-2 border-green-500 text-green-600 hover:bg-green-50',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if (showCopyOption && message) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={buttonClasses}
        >
          <MessageCircle className="w-5 h-5" />
          Share via WhatsApp
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            <button
              onClick={() => {
                onClick();
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
            >
              <MessageCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium">Open WhatsApp</span>
            </button>
            
            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition border-t"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium">Copy Message</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button onClick={onClick} className={buttonClasses}>
      <MessageCircle className="w-5 h-5" />
      Share via WhatsApp
    </button>
  );
}

interface QuickWhatsAppButtonProps {
  phoneNumber: string;
  message: string;
  label?: string;
  className?: string;
}

export function QuickWhatsAppButton({
  phoneNumber,
  message,
  label = 'WhatsApp',
  className = '',
}: QuickWhatsAppButtonProps) {
  const handleClick = () => {
    const formattedPhone = phoneNumber.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    window.open(url, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition ${className}`}
    >
      <MessageCircle className="w-4 h-4" />
      {label}
    </button>
  );
}
