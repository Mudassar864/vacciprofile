'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, CheckCircle, XCircle, LogOut, Database } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CrudTable } from '@/components/admin/crud-table';

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activeView, setActiveView] = useState<'upload' | 'manage'>('upload');
  const [tableData, setTableData] = useState<any>({
    manufacturers: [],
    licensed_vaccines: [],
    vaccine_candidates: [],
    licensing_authorities: [],
    nitags: []
  });
  const router = useRouter();

  useEffect(() => {
    checkAndCreateAdmin();
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        setUser(session?.user ?? null);
        setLoading(false);
        if (session?.user) {
          fetchAllData();
        }
      })();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function fetchAllData() {
    const tables = ['manufacturers', 'licensed_vaccines', 'vaccine_candidates', 'licensing_authorities', 'nitags'];
    const newData: any = {};

    for (const table of tables) {
      const { data } = await supabase.from(table).select('*').order('created_at', { ascending: false });
      newData[table] = data || [];
    }

    setTableData(newData);
  }

  async function checkAndCreateAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setLoading(false);

    if (!user) {
      setMessage({
        type: 'success',
        text: 'Default admin: admin@vacciprofile.com | Password: VacciProfile2025!'
      });
      setEmail('admin@vacciprofile.com');
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Logged in successfully!' });
    }
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
  }

  async function handleCSVUpload(e: React.ChangeEvent<HTMLInputElement>, table: string) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    try {
      const text = await file.text();
      const rows = text.split('\n').map(row => row.split(','));
      const headers = rows[0].map(h => h.trim());
      const data = rows.slice(1).filter(row => row.length > 1 && row[0].trim());

      const records = data.map(row => {
        const record: any = {};
        headers.forEach((header, index) => {
          const value = row[index]?.trim();
          if (value) {
            record[header] = value;
          }
        });
        return record;
      });

      const { error } = await supabase
        .from(table as any)
        .insert(records as any);

      if (error) throw error;

      setMessage({ type: 'success', text: `Successfully uploaded ${records.length} records to ${table}!` });
      e.target.value = '';
      fetchAllData();
    } catch (error: any) {
      setMessage({ type: 'error', text: `Error uploading CSV: ${error.message}` });
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>Sign in to access the admin panel</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>
              {message && (
                <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Admin Panel</h1>
              <p className="text-white/90 mt-1">Upload and manage vaccine data</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="bg-white text-orange-600 hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {message && (
          <Alert
            variant={message.type === 'error' ? 'destructive' : 'default'}
            className="mb-6"
          >
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => setActiveView('upload')}
            variant={activeView === 'upload' ? 'default' : 'outline'}
            className={activeView === 'upload' ? 'bg-orange-600 hover:bg-orange-700' : ''}
          >
            <Upload className="w-4 h-4 mr-2" />
            CSV Upload
          </Button>
          <Button
            onClick={() => setActiveView('manage')}
            variant={activeView === 'manage' ? 'default' : 'outline'}
            className={activeView === 'manage' ? 'bg-orange-600 hover:bg-orange-700' : ''}
          >
            <Database className="w-4 h-4 mr-2" />
            Manage Data
          </Button>
        </div>

        {activeView === 'upload' && (
          <>
          <Card>
          <CardHeader>
            <CardTitle>CSV Data Upload</CardTitle>
            <CardDescription>
              Upload CSV files to populate the database. Each CSV should have column headers matching the database field names.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="manufacturers" className="w-full">
              <TabsList className="grid grid-cols-2 lg:grid-cols-4 mb-6">
                <TabsTrigger value="manufacturers">Manufacturers</TabsTrigger>
                <TabsTrigger value="vaccines">Licensed Vaccines</TabsTrigger>
                <TabsTrigger value="candidates">Candidates</TabsTrigger>
                <TabsTrigger value="authorities">Authorities</TabsTrigger>
                <TabsTrigger value="nitags">NITAGs</TabsTrigger>
              </TabsList>

              <TabsContent value="manufacturers">
                <UploadSection
                  title="Manufacturers"
                  description="Upload manufacturer data (name, website, headquarters, founded, ceo, revenue_operating_income_net_income, total_assets_total_equity, num_employees, history, licensed_vaccines, vaccine_candidates). All fields accept text values. Optional: licensed_vaccines and vaccine_candidates are comma-separated lists for display."
                  onUpload={(e) => handleCSVUpload(e, 'manufacturers')}
                  uploading={uploading}
                />
              </TabsContent>

              <TabsContent value="vaccines">
                <UploadSection
                  title="Licensed Vaccines"
                  description="Upload vaccine data (pathogen_name, vaccine_brand_name, single_or_combination, authority_name, vaccine_link, authority_link, manufacturer). Use exact manufacturer names."
                  onUpload={(e) => handleCSVUpload(e, 'licensed_vaccines')}
                  uploading={uploading}
                />
              </TabsContent>

              <TabsContent value="candidates">
                <UploadSection
                  title="Vaccine Candidates"
                  description="Upload vaccine candidate data (pathogen_name, vaccine_name, vaccine_link, phase_i, phase_ii, phase_iii, phase_iv, manufacturer). Phase columns accept text values (e.g., 'Completed', 'In Progress', 'Phase I/II', etc.). Use exact manufacturer names."
                  onUpload={(e) => handleCSVUpload(e, 'vaccine_candidates')}
                  uploading={uploading}
                />
              </TabsContent>

              <TabsContent value="authorities">
                <UploadSection
                  title="Licensing Authorities"
                  description="Upload authority data (country, authority_name, info, vaccine_brand_name, single_or_combination, pathogen_name, manufacturer, website). This table stores both authority info and vaccine-authority relationships."
                  onUpload={(e) => handleCSVUpload(e, 'licensing_authorities')}
                  uploading={uploading}
                />
              </TabsContent>

              <TabsContent value="nitags">
                <UploadSection
                  title="NITAGs"
                  description="Upload NITAG data (country, available (true/false), website, url, nitag_name, established)"
                  onUpload={(e) => handleCSVUpload(e, 'nitags')}
                  uploading={uploading}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>CSV Format Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <ul className="space-y-2 text-gray-700">
              <li>First row must contain column headers matching database field names</li>
              <li>Use commas to separate values</li>
              <li>For foreign keys (pathogen_id, manufacturer_id, etc.), use the UUID from the database</li>
              <li>For slug fields, use lowercase with hyphens (e.g., "abbott-biologicals")</li>
              <li>Dates should be in YYYY-MM-DD format</li>
              <li>Text fields with commas should be enclosed in double quotes</li>
            </ul>
          </CardContent>
        </Card>
        </>
        )}

        {activeView === 'manage' && (
          <Tabs defaultValue="manufacturers" className="w-full">
            <TabsList className="grid grid-cols-2 lg:grid-cols-5 mb-6">
              <TabsTrigger value="manufacturers">Manufacturers</TabsTrigger>
              <TabsTrigger value="vaccines">Licensed Vaccines</TabsTrigger>
              <TabsTrigger value="candidates">Candidates</TabsTrigger>
              <TabsTrigger value="authorities">Authorities</TabsTrigger>
              <TabsTrigger value="nitags">NITAGs</TabsTrigger>
            </TabsList>

            <TabsContent value="manufacturers">
              <Card>
                <CardHeader>
                  <CardTitle>Manufacturers</CardTitle>
                  <CardDescription>Add, edit, or delete manufacturer records</CardDescription>
                </CardHeader>
                <CardContent>
                  <CrudTable
                    tableName="manufacturers"
                    data={tableData.manufacturers}
                    columns={[
                      { key: 'name', label: 'Name' },
                      { key: 'headquarters', label: 'Headquarters' },
                      { key: 'founded', label: 'Founded' },
                      { key: 'ceo', label: 'CEO' },
                      { key: 'website', label: 'Website' }
                    ]}
                    idField="manufacturer_id"
                    onDataChange={fetchAllData}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vaccines">
              <Card>
                <CardHeader>
                  <CardTitle>Licensed Vaccines</CardTitle>
                  <CardDescription>Add, edit, or delete licensed vaccine records</CardDescription>
                </CardHeader>
                <CardContent>
                  <CrudTable
                    tableName="licensed_vaccines"
                    data={tableData.licensed_vaccines}
                    columns={[
                      { key: 'pathogen_name', label: 'Pathogen' },
                      { key: 'vaccine_brand_name', label: 'Vaccine Name' },
                      { key: 'single_or_combination', label: 'Type' },
                      { key: 'manufacturer', label: 'Manufacturer' },
                      { key: 'authority_name', label: 'Authority' },
                      { key: 'vaccine_link', label: 'Vaccine Link' },
                      { key: 'authority_link', label: 'Authority Link' }
                    ]}
                    idField="licensed_vaccine_id"
                    onDataChange={fetchAllData}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="candidates">
              <Card>
                <CardHeader>
                  <CardTitle>Vaccine Candidates</CardTitle>
                  <CardDescription>Add, edit, or delete vaccine candidate records</CardDescription>
                </CardHeader>
                <CardContent>
                  <CrudTable
                    tableName="vaccine_candidates"
                    data={tableData.vaccine_candidates}
                    columns={[
                      { key: 'pathogen_name', label: 'Pathogen' },
                      { key: 'vaccine_name', label: 'Vaccine Name' },
                      { key: 'manufacturer', label: 'Manufacturer' },
                      { key: 'phase_i', label: 'Phase I' },
                      { key: 'phase_ii', label: 'Phase II' },
                      { key: 'phase_iii', label: 'Phase III' },
                      { key: 'phase_iv', label: 'Phase IV' },
                      { key: 'vaccine_link', label: 'Link' }
                    ]}
                    idField="candidate_id"
                    onDataChange={fetchAllData}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="authorities">
              <Card>
                <CardHeader>
                  <CardTitle>Licensing Authorities</CardTitle>
                  <CardDescription>Add, edit, or delete licensing authority records</CardDescription>
                </CardHeader>
                <CardContent>
                  <CrudTable
                    tableName="licensing_authorities"
                    data={tableData.licensing_authorities}
                    columns={[
                      { key: 'country', label: 'Country' },
                      { key: 'authority_name', label: 'Authority Name' },
                      { key: 'vaccine_brand_name', label: 'Vaccine' },
                      { key: 'pathogen_name', label: 'Pathogen' },
                      { key: 'manufacturer', label: 'Manufacturer' },
                      { key: 'website', label: 'Website' }
                    ]}
                    idField="authority_id"
                    onDataChange={fetchAllData}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="nitags">
              <Card>
                <CardHeader>
                  <CardTitle>NITAGs</CardTitle>
                  <CardDescription>Add, edit, or delete NITAG records</CardDescription>
                </CardHeader>
                <CardContent>
                  <CrudTable
                    tableName="nitags"
                    data={tableData.nitags}
                    columns={[
                      { key: 'country', label: 'Country' },
                      { key: 'nitag_name', label: 'NITAG Name' },
                      { key: 'available', label: 'Available', type: 'boolean' },
                      { key: 'established', label: 'Established' },
                      { key: 'website', label: 'Website' },
                      { key: 'url', label: 'URL' }
                    ]}
                    idField="nitag_id"
                    onDataChange={fetchAllData}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

function UploadSection({
  title,
  description,
  onUpload,
  uploading
}: {
  title: string;
  description: string;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
}) {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <Label htmlFor={`upload-${title}`} className="cursor-pointer">
        <div className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? 'Uploading...' : 'Choose CSV File'}
        </div>
        <Input
          id={`upload-${title}`}
          type="file"
          accept=".csv"
          onChange={onUpload}
          disabled={uploading}
          className="hidden"
        />
      </Label>
    </div>
  );
}
