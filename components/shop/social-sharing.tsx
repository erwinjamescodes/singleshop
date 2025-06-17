"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Share2,
  Twitter,
  Facebook,
  Instagram,
  Copy,
  Check,
  MessageCircle,
} from "lucide-react";

interface SocialSharingProps {
  productName: string;
  productDescription: string;
  productPrice: number;
  shopUrl: string;
  productImage?: string;
}

export default function SocialSharing({
  productName,
  productDescription,
  productPrice,
  shopUrl,
  productImage,
}: SocialSharingProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const shareUrl = `https://singleshop.com${shopUrl}`;
  const price = (productPrice / 100).toFixed(2);

  const shareText = `Check out ${productName} for $${price}! ${productDescription.slice(
    0,
    100
  )}${productDescription.length > 100 ? "..." : ""}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareUrl
    )}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(
      shareText + " " + shareUrl
    )}`;
    window.open(url, "_blank");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: shareText,
          url: shareUrl,
        });
      } catch (err: any) {
        // Don't log error if user simply canceled the share dialog
        if (err.name !== "AbortError" && !err.message.includes("canceled")) {
          console.error("Error sharing:", err);
        }
      }
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={handleNativeShare}
        variant="outline"
        size="sm"
        className="flex items-center space-x-2"
      >
        <Share2 className="h-4 w-4" />
        <span>Share</span>
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <h4 className="font-medium mb-3">Share this product</h4>

            <div className="space-y-2">
              <Button
                onClick={shareToTwitter}
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Twitter className="h-4 w-4 mr-2 text-blue-400" />
                Share on Twitter
              </Button>

              <Button
                onClick={shareToFacebook}
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                Share on Facebook
              </Button>

              <Button
                onClick={shareToWhatsApp}
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
                Share on WhatsApp
              </Button>

              <div className="border-t pt-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-2 py-1 text-xs bg-gray-50 border rounded"
                  />
                  <Button
                    onClick={copyToClipboard}
                    size="sm"
                    variant="outline"
                    className="px-2"
                  >
                    {copied ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                {copied && (
                  <p className="text-xs text-green-600 mt-1">Link copied!</p>
                )}
              </div>
            </div>
          </div>

          <div className="px-4 py-2 bg-gray-50 rounded-b-lg">
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
