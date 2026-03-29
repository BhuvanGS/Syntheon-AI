'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Copy,
  Key,
  RefreshCw,
  Shield,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function ApiKeyManager() {
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [maskedKey, setMaskedKey] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    checkExistingKey();
  }, []);

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return key;
    return key.substring(0, 4) + '*'.repeat(key.length - 8) + key.substring(key.length - 4);
  };

  const checkExistingKey = async () => {
    try {
      const response = await fetch('/api/check-key');
      const data = await response.json();
      setHasExistingKey(data.hasKey);
    } catch (error) {
      console.error('Failed to check existing key:', error);
    }
  };

  const generateKey = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/generate-key', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate key');
      }

      const data = await response.json();
      setApiKey(data.apiKey);
      setMaskedKey(maskApiKey(data.apiKey));
      setHasExistingKey(true);
      setShowKey(false); // Start with masked view

      toast({
        title: '✅ API Key Generated',
        description: 'Your new API key has been created. Save it securely!',
      });
    } catch (error) {
      console.error('Failed to generate key:', error);
      toast({
        title: '❌ Generation Failed',
        description: 'Could not generate API key',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const regenerateKey = async () => {
    if (!confirm('Are you sure? This will invalidate your previous API key.')) {
      return;
    }

    await generateKey();
  };

  const copyToClipboard = async () => {
    if (!apiKey) return;

    try {
      await navigator.clipboard.writeText(apiKey); // Always copy the full key
      setCopied(true);

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);

      toast({
        title: '✅ Copied!',
        description: 'API key copied to clipboard',
      });
    } catch (error) {
      toast({
        title: '❌ Copy Failed',
        description: 'Could not copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e8dfd0',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '2rem',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              background: '#f0f8ff',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Key size={24} color="#5c7c5d" />
          </div>
          <div>
            <h2
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: '1.4rem',
                fontWeight: '400',
                color: '#2c2c28',
                marginBottom: '0.25rem',
              }}
            >
              Syntheon Extension API
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: '#8a8a80',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Generate API keys for the Syntheon browser extension
            </p>
          </div>
        </div>

        {hasExistingKey && (
          <div
            style={{
              background: '#e8f5e9',
              color: '#2e7d32',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontSize: '12px',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: '500',
            }}
          >
            ✓ Active
          </div>
        )}
      </div>

      {/* Content */}
      {hasExistingKey ? (
        <div>
          {apiKey ? (
            <div>
              {/* Show Generated Key */}
              <div
                style={{
                  background: '#f1f8f5',
                  border: '1px solid #c8e6c9',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={16} color="#2e7d32" />
                    <span
                      style={{
                        fontSize: '14px',
                        color: '#1b5e20',
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: '500',
                      }}
                    >
                      Your API Key
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                      onClick={() => setShowKey(!showKey)}
                      size="sm"
                      variant="outline"
                      style={{
                        borderColor: '#c8e6c9',
                        color: '#2e7d32',
                        fontSize: '12px',
                        fontFamily: "'DM Sans', sans-serif",
                        background: '#ffffff',
                      }}
                    >
                      {showKey ? (
                        <>
                          <EyeOff size={14} style={{ marginRight: '0.5rem' }} />
                          Hide
                        </>
                      ) : (
                        <>
                          <Eye size={14} style={{ marginRight: '0.5rem' }} />
                          Show
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={copyToClipboard}
                      size="sm"
                      style={{
                        background: copied ? '#2e7d32' : '#5c7c5d',
                        border: 'none',
                        color: 'white',
                        fontSize: '12px',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {copied ? (
                        <>
                          <Check size={14} style={{ marginRight: '0.5rem' }} />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={14} style={{ marginRight: '0.5rem' }} />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #c8e6c9',
                    borderRadius: '6px',
                    padding: '1rem',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    color: '#2c2c28',
                    wordBreak: 'break-all',
                    marginBottom: '1rem',
                    letterSpacing: showKey ? 'normal' : '0.05em',
                  }}
                >
                  {showKey ? apiKey : maskedKey}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '12px',
                    color: '#558b2f',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <AlertCircle size={14} />
                  <span>
                    {showKey
                      ? 'Keep your API key secure and never share it publicly!'
                      : 'Click Show to reveal the full API key'}
                  </span>
                </div>
              </div>

              {/* Regenerate Button */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Button
                  onClick={regenerateKey}
                  disabled={loading}
                  style={{
                    background: '#5c7c5d',
                    border: 'none',
                    color: 'white',
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: '500',
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={16} style={{ marginRight: '0.5rem' }} />
                      Regenerate Key
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            /* Existing Key State - no key in state but exists in DB */
            <div>
              <div
                style={{
                  background: '#fff3e0',
                  border: '1px solid #ffe0b2',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                }}
              >
                <div style={{ color: '#f57c00', fontSize: '20px', marginTop: '0.25rem' }}>
                  <Key size={20} />
                </div>
                <div>
                  <p
                    style={{
                      fontSize: '14px',
                      color: '#e65100',
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: '500',
                      marginBottom: '0.25rem',
                    }}
                  >
                    API Key Already Exists
                  </p>
                  <p
                    style={{
                      fontSize: '12px',
                      color: '#d84315',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    You already have an active API key. Generate a new one to replace it.
                  </p>
                </div>
              </div>

              {/* Regenerate Button */}
              <Button
                onClick={regenerateKey}
                disabled={loading}
                style={{
                  background: '#5c7c5d',
                  border: 'none',
                  color: 'white',
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: '500',
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} style={{ marginRight: '0.5rem' }} />
                    Regenerate Key
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* No Key State */}
          <div
            style={{
              background: '#f0f8ff',
              border: '1px solid #e3f2fd',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
            }}
          >
            <div style={{ color: '#1976d2', fontSize: '20px', marginTop: '0.25rem' }}>
              <Key size={20} />
            </div>
            <div>
              <p
                style={{
                  fontSize: '14px',
                  color: '#1565c0',
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: '500',
                  marginBottom: '0.25rem',
                }}
              >
                No API Key Found
              </p>
              <p
                style={{
                  fontSize: '12px',
                  color: '#0d47a1',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Generate an API key to use the Syntheon browser extension
              </p>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={generateKey}
            disabled={loading}
            style={{
              background: '#5c7c5d',
              border: 'none',
              color: 'white',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: '500',
            }}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Key size={16} style={{ marginRight: '0.5rem' }} />
                Generate API Key
              </>
            )}
          </Button>
        </div>
      )}

      {/* Usage Info */}
      <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e8dfd0' }}>
        <p
          style={{
            fontSize: '12px',
            color: '#8a8a80',
            fontWeight: '500',
            marginBottom: '0.75rem',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          What this API key is used for:
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {[
            'Authenticate the Syntheon browser extension',
            'Access your meeting data and specifications',
            'Generate code and create pull requests',
            'Sync with your GitHub repositories',
          ].map((item, i) => (
            <li
              key={i}
              style={{
                fontSize: '13px',
                color: '#8a8a80',
                fontFamily: "'DM Sans', sans-serif",
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
              }}
            >
              <span
                style={{
                  width: '4px',
                  height: '4px',
                  background: '#8aab7e',
                  borderRadius: '50%',
                  display: 'inline-block',
                  flexShrink: 0,
                }}
              />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
