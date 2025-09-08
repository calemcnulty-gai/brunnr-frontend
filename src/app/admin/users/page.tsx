'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUserRole } from '@/hooks/use-user-role'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Search, UserPlus, Shield, Building, User, Mail, Calendar } from 'lucide-react'
import { format } from 'date-fns'

interface UserWithRole {
  id: string
  email: string
  created_at: string
  role?: {
    role: 'admin' | 'partner' | 'user'
    partner?: {
      id: string
      name: string
      partner_code: string
    }
  }
}

interface Partner {
  id: string
  name: string
  partner_code: string
}

export default function UserManagementPage() {
  const router = useRouter()
  const { role, isLoading: roleLoading } = useUserRole()
  const [users, setUsers] = useState<UserWithRole[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [newRole, setNewRole] = useState<string>('')
  const [newPartnerId, setNewPartnerId] = useState<string>('')
  
  const supabase = createClient()
  
  useEffect(() => {
    if (!roleLoading && role !== 'admin') {
      router.push('/dashboard')
    } else if (role === 'admin') {
      fetchUsers()
      fetchPartners()
    }
  }, [role, roleLoading, router])
  
  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      // Fetch all users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      
      if (authError) throw authError
      
      // Fetch user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role,
          partner:partners (
            id,
            name,
            partner_code
          )
        `)
      
      if (rolesError) throw rolesError
      
      // Combine user data with roles
      const usersWithRoles: UserWithRole[] = authUsers.users.map(user => {
        const userRole = userRoles?.find(r => r.user_id === user.id)
        return {
          id: user.id,
          email: user.email || 'No email',
          created_at: user.created_at,
          role: userRole ? {
            role: userRole.role as 'admin' | 'partner' | 'user',
            partner: userRole.partner || undefined
          } : undefined
        }
      })
      
      setUsers(usersWithRoles)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('id, name, partner_code')
        .order('name')
      
      if (error) throw error
      setPartners(data || [])
    } catch (error) {
      console.error('Failed to fetch partners:', error)
    }
  }
  
  const handleRoleUpdate = async (userId: string) => {
    try {
      // Call the assign_user_role function
      const { error } = await supabase.rpc('assign_user_role', {
        p_user_id: userId,
        p_role: newRole,
        p_partner_id: newRole === 'partner' ? newPartnerId : undefined
      })
      
      if (error) throw error
      
      // Refresh users list
      await fetchUsers()
      
      // Reset editing state
      setEditingUser(null)
      setNewRole('')
      setNewPartnerId('')
    } catch (error) {
      console.error('Failed to update user role:', error)
    }
  }
  
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === 'all' || 
      (selectedRole === 'none' && !user.role) ||
      (user.role?.role === selectedRole)
    return matchesSearch && matchesRole
  })
  
  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'partner': return 'bg-blue-100 text-blue-800'
      case 'user': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-3 w-3" />
      case 'partner': return <Building className="h-3 w-3" />
      case 'user': return <User className="h-3 w-3" />
      default: return null
    }
  }
  
  if (roleLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (role !== 'admin') {
    return null
  }
  
  return (
    <div className="container mx-auto max-w-7xl py-8 px-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/usage-dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-gray-600">Manage user roles and permissions</p>
      </div>
      
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="partner">Partners</SelectItem>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="none">No Role</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Manage user roles and partner assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map(user => (
              <div
                key={user.id}
                className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Joined {format(new Date(user.created_at), 'MMM d, yyyy')}</span>
                    </div>
                    {user.role && (
                      <Badge className={`${getRoleBadgeColor(user.role.role)} flex items-center gap-1`}>
                        {getRoleIcon(user.role.role)}
                        {user.role.role}
                      </Badge>
                    )}
                    {user.role?.partner && (
                      <Badge variant="outline">
                        {user.role.partner.name}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {editingUser === user.id ? (
                  <div className="flex items-end gap-2 mt-4 md:mt-0">
                    <div>
                      <Label htmlFor={`role-${user.id}`} className="text-xs">Role</Label>
                      <Select value={newRole} onValueChange={setNewRole}>
                        <SelectTrigger id={`role-${user.id}`} className="w-[120px]">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="partner">Partner</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {newRole === 'partner' && (
                      <div>
                        <Label htmlFor={`partner-${user.id}`} className="text-xs">Partner</Label>
                        <Select value={newPartnerId} onValueChange={setNewPartnerId}>
                          <SelectTrigger id={`partner-${user.id}`} className="w-[150px]">
                            <SelectValue placeholder="Select partner" />
                          </SelectTrigger>
                          <SelectContent>
                            {partners.map(partner => (
                              <SelectItem key={partner.id} value={partner.id}>
                                {partner.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handleRoleUpdate(user.id)}
                      disabled={!newRole || (newRole === 'partner' && !newPartnerId)}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingUser(null)
                        setNewRole('')
                        setNewPartnerId('')
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingUser(user.id)
                      setNewRole(user.role?.role || 'user')
                      setNewPartnerId(user.role?.partner?.id || '')
                    }}
                  >
                    Edit Role
                  </Button>
                )}
              </div>
            ))}
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No users found matching your criteria
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
