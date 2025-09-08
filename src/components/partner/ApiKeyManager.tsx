/**
 * @fileoverview API key management component for partners
 * @module components/partner/ApiKeyManager
 */

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Key, 
  Plus, 
  Copy, 
  Trash2, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Calendar,
  Activity,
  AlertCircle 
} from 'lucide-react'
import { format } from 'date-fns'
import crypto from 'crypto'

interface ApiKey {
  id: string
  name: string
  key_prefix: string
  is_active: boolean
  created_at: string
  last_used_at: string | null
  usage_count: number
  seat_identifier?: string
}

interface ApiKeyManagerProps {
  partnerId: string
  partnerName?: string
}

export function ApiKeyManager({ partnerId, partnerName }: ApiKeyManagerProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeySeat, setNewKeySeat] = useState('')
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  
  const supabase = createClient()
  
  useEffect(() => {
    fetchApiKeys()
  }, [partnerId])
  
  const fetchApiKeys = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      // Transform data to match interface
      const keys: ApiKey[] = (data || []).map(key => ({
        id: key.id,
        name: key.seat_name || `Key ${key.key_prefix}`,
        key_prefix: key.key_prefix,
        is_active: key.is_active ?? true,
        created_at: key.created_at || new Date().toISOString(),
        last_used_at: key.last_used_at,
        usage_count: key.request_count || 0,
        seat_identifier: key.seat_name || undefined
      }))
      
      setApiKeys(keys)
    } catch (error) {
      console.error('Failed to fetch API keys:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const generateApiKey = () => {
    // Generate a secure random API key
    const keyBytes = crypto.randomBytes(32)
    const key = `brunnr_${keyBytes.toString('hex')}`
    return key
  }
  
  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return
    
    try {
      // Generate new key
      const fullKey = generateApiKey()
      const keyPrefix = fullKey.substring(0, 12) + '...'
      const keyHash = crypto.createHash('sha256').update(fullKey).digest('hex')
      
      // Insert into database
      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          partner_id: partnerId,
          seat_name: newKeyName,
          key_prefix: keyPrefix,
          key_hash: keyHash,
          is_active: true
        })
        .select()
        .single()
      
      if (error) throw error
      
      // Show generated key to user (only time it's visible)
      setGeneratedKey(fullKey)
      
      // Refresh list
      await fetchApiKeys()
    } catch (error) {
      console.error('Failed to create API key:', error)
    }
  }
  
  const handleDeleteKey = async (keyId: string) => {
    try {
      // Soft delete - just deactivate the key
      const { error } = await supabase
        .from('api_keys')
        .update({ is_active: false })
        .eq('id', keyId)
      
      if (error) throw error
      
      // Refresh list
      await fetchApiKeys()
      setShowDeleteDialog(null)
    } catch (error) {
      console.error('Failed to delete API key:', error)
    }
  }
  
  const handleRotateKey = async (keyId: string) => {
    try {
      // Deactivate old key
      await supabase
        .from('api_keys')
        .update({ is_active: false })
        .eq('id', keyId)
      
      // Get old key details
      const oldKey = apiKeys.find(k => k.id === keyId)
      if (!oldKey) return
      
      // Create new key with same name
      const fullKey = generateApiKey()
      const keyPrefix = fullKey.substring(0, 12) + '...'
      const keyHash = crypto.createHash('sha256').update(fullKey).digest('hex')
      
      const { error } = await supabase
        .from('api_keys')
        .insert({
          partner_id: partnerId,
          seat_name: `${oldKey.name} (rotated)`,
          key_prefix: keyPrefix,
          key_hash: keyHash,
          is_active: true
        })
      
      if (error) throw error
      
      // Show new key
      setGeneratedKey(fullKey)
      
      // Refresh list
      await fetchApiKeys()
    } catch (error) {
      console.error('Failed to rotate API key:', error)
    }
  }
  
  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(keyId)
    setTimeout(() => setCopiedKey(null), 2000)
  }
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              Manage API keys for {partnerName || 'your organization'}
            </CardDescription>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create New Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New API Key</DialogTitle>
                <DialogDescription>
                  Generate a new API key for accessing the Brunnr API
                </DialogDescription>
              </DialogHeader>
              
              {!generatedKey ? (
                <>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="key-name">Key Name</Label>
                      <Input
                        id="key-name"
                        placeholder="e.g., Production Key"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="seat-id">Seat Identifier (Optional)</Label>
                      <Input
                        id="seat-id"
                        placeholder="e.g., user@example.com"
                        value={newKeySeat}
                        onChange={(e) => setNewKeySeat(e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Used to track which user or system is using this key
                      </p>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateKey} disabled={!newKeyName.trim()}>
                      Generate Key
                    </Button>
                  </DialogFooter>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-yellow-900">Important!</p>
                          <p className="text-sm text-yellow-700 mt-1">
                            This is the only time you'll see this API key. Make sure to copy and store it securely.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Your API Key</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          value={generatedKey}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(generatedKey, 'new')}
                        >
                          {copiedKey === 'new' ? (
                            <>Copied!</>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button
                      onClick={() => {
                        setShowCreateDialog(false)
                        setGeneratedKey(null)
                        setNewKeyName('')
                        setNewKeySeat('')
                      }}
                    >
                      Done
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {apiKeys.length === 0 ? (
          <div className="text-center py-8">
            <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No API keys yet</p>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Your First Key
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {apiKeys.map(key => (
              <div
                key={key.id}
                className={`border rounded-lg p-4 ${!key.is_active ? 'bg-gray-50 opacity-60' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{key.name}</span>
                      <Badge variant={key.is_active ? 'default' : 'secondary'}>
                        {key.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {key.seat_identifier && (
                        <Badge variant="outline">{key.seat_identifier}</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Key className="h-3 w-3" />
                        <span className="font-mono">{key.key_prefix}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Created {format(new Date(key.created_at), 'MMM d, yyyy')}</span>
                      </div>
                      {key.last_used_at && (
                        <div className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          <span>Last used {format(new Date(key.last_used_at), 'MMM d')}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        <span>{key.usage_count} requests</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRotateKey(key.id)}
                      disabled={!key.is_active}
                      title="Rotate key"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    
                    <Dialog
                      open={showDeleteDialog === key.id}
                      onOpenChange={(open) => setShowDeleteDialog(open ? key.id : null)}
                    >
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!key.is_active}
                          title="Deactivate key"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Deactivate API Key</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to deactivate "{key.name}"? This action cannot be undone
                            and any applications using this key will stop working.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleDeleteKey(key.id)}
                          >
                            Deactivate Key
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
