import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  Target, 
  DollarSign,
  MousePointer,
  Eye,
  MapPin,
  Zap,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  Settings,
  RefreshCw,
  Filter,
  Download,
  Smartphone,
  Monitor,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

// Mock data for the dashboard
const mockData = {
  overview: {
    totalSpent: 12540.89,
    totalImpressions: 892456,
    totalClicks: 23847,
    conversions: 1245,
    ctr: 2.67,
    cpc: 0.53,
    roas: 4.2,
    qualityScore: 8.3
  },
  campaigns: [
    {
      id: 1,
      name: "Hair Cutting Services - Premium",
      status: "Active",
      budget: 500,
      spent: 387.45,
      impressions: 45230,
      clicks: 1245,
      conversions: 89,
      ctr: 2.75,
      cpc: 0.31,
      roas: 5.2,
      qualityScore: 8.7
    },
    {
      id: 2,
      name: "Beard Grooming - Local",
      status: "Active",
      budget: 300,
      spent: 234.67,
      impressions: 32100,
      clicks: 867,
      conversions: 52,
      ctr: 2.7,
      cpc: 0.27,
      roas: 3.8,
      qualityScore: 7.9
    },
    {
      id: 3,
      name: "Wedding Packages - Premium",
      status: "Paused",
      budget: 800,
      spent: 156.23,
      impressions: 18900,
      clicks: 345,
      conversions: 34,
      ctr: 1.82,
      cpc: 0.45,
      roas: 6.1,
      qualityScore: 9.1
    },
    {
      id: 4,
      name: "Seasonal Promotions",
      status: "Active",
      budget: 200,
      spent: 189.34,
      impressions: 28450,
      clicks: 756,
      conversions: 41,
      ctr: 2.66,
      cpc: 0.25,
      roas: 4.7,
      qualityScore: 8.2
    }
  ],
  keywords: [
    { keyword: "barbershop near me", impressions: 12450, clicks: 456, ctr: 3.66, cpc: 0.42, conversions: 34 },
    { keyword: "hair cut services", impressions: 8930, clicks: 234, ctr: 2.62, cpc: 0.38, conversions: 18 },
    { keyword: "beard trimming", impressions: 6720, clicks: 189, ctr: 2.81, cpc: 0.31, conversions: 12 },
    { keyword: "wedding hair styling", impressions: 4560, clicks: 167, ctr: 3.66, cpc: 0.52, conversions: 23 },
    { keyword: "professional barber", impressions: 3890, clicks: 134, ctr: 3.44, cpc: 0.29, conversions: 8 }
  ],
  locations: [
    { location: "Riyadh", impressions: 89230, clicks: 2456, conversions: 189, spend: 1234.56 },
    { location: "Jeddah", impressions: 67450, clicks: 1789, conversions: 134, spend: 894.23 },
    { location: "Dammam", impressions: 34560, clicks: 934, conversions: 67, spend: 567.89 },
    { location: "Mecca", impressions: 23450, clicks: 678, conversions: 45, spend: 345.67 }
  ],
  devices: [
    { device: "Mobile", impressions: 134560, clicks: 3456, conversions: 234, percentage: 62 },
    { device: "Desktop", impressions: 89230, clicks: 2134, conversions: 167, percentage: 28 },
    { device: "Tablet", impressions: 23450, clicks: 567, conversions: 34, percentage: 10 }
  ],
  recentActivity: [
    { action: "Campaign 'Hair Cutting Services - Premium' budget increased", time: "2 hours ago", type: "budget" },
    { action: "New keyword 'luxury barbershop' added", time: "4 hours ago", type: "keyword" },
    { action: "Ad group 'Beard Services' paused", time: "6 hours ago", type: "pause" },
    { action: "Bid adjustment for mobile devices", time: "8 hours ago", type: "bid" },
    { action: "Campaign 'Wedding Packages' resumed", time: "1 day ago", type: "resume" }
  ]
};

export const GoogleAdsTab: React.FC = React.memo(() => {
  const [activeTab, setActiveTab] = useState("overview");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Active': { variant: 'default' as const, color: 'bg-green-500' },
      'Paused': { variant: 'secondary' as const, color: 'bg-yellow-500' },
      'Ended': { variant: 'destructive' as const, color: 'bg-red-500' }
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.Active;
  };

  const MetricCard = ({ title, value, change, icon: Icon, trend }: {
    title: string;
    value: string;
    change: string;
    icon: React.ElementType;
    trend: 'up' | 'down';
  }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className={`text-xs flex items-center gap-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {change}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Google Ads Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor and optimize your advertising campaigns with real-time insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Spent"
              value={formatCurrency(mockData.overview.totalSpent)}
              change="+12.5% from last month"
              icon={DollarSign}
              trend="up"
            />
            <MetricCard
              title="Total Impressions"
              value={formatNumber(mockData.overview.totalImpressions)}
              change="+8.3% from last month"
              icon={Eye}
              trend="up"
            />
            <MetricCard
              title="Total Clicks"
              value={formatNumber(mockData.overview.totalClicks)}
              change="+15.2% from last month"
              icon={MousePointer}
              trend="up"
            />
            <MetricCard
              title="Conversions"
              value={formatNumber(mockData.overview.conversions)}
              change="+22.1% from last month"
              icon={Target}
              trend="up"
            />
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Click-Through Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockData.overview.ctr}%</div>
                <Progress value={mockData.overview.ctr * 10} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Cost Per Click</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(mockData.overview.cpc)}</div>
                <Progress value={75} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Return on Ad Spend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockData.overview.roas}x</div>
                <Progress value={84} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockData.overview.qualityScore}/10</div>
                <Progress value={mockData.overview.qualityScore * 10} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>Monitor and manage your active advertising campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Spent</TableHead>
                    <TableHead>Impressions</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>CTR</TableHead>
                    <TableHead>CPC</TableHead>
                    <TableHead>ROAS</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockData.campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(campaign.status).variant}>
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(campaign.budget)}</TableCell>
                      <TableCell>{formatCurrency(campaign.spent)}</TableCell>
                      <TableCell>{formatNumber(campaign.impressions)}</TableCell>
                      <TableCell>{formatNumber(campaign.clicks)}</TableCell>
                      <TableCell>{campaign.ctr}%</TableCell>
                      <TableCell>{formatCurrency(campaign.cpc)}</TableCell>
                      <TableCell>{campaign.roas}x</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <Play className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <Pause className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <Settings className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Keywords</CardTitle>
              <CardDescription>Analyze keyword performance and optimize your targeting</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Keyword</TableHead>
                    <TableHead>Impressions</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>CTR</TableHead>
                    <TableHead>CPC</TableHead>
                    <TableHead>Conversions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockData.keywords.map((keyword, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{keyword.keyword}</TableCell>
                      <TableCell>{formatNumber(keyword.impressions)}</TableCell>
                      <TableCell>{formatNumber(keyword.clicks)}</TableCell>
                      <TableCell>{keyword.ctr}%</TableCell>
                      <TableCell>{formatCurrency(keyword.cpc)}</TableCell>
                      <TableCell>{keyword.conversions}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Geographic Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Geographic Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockData.locations.map((location, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">{location.location}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatNumber(location.impressions)} impressions
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(location.spend)}</p>
                        <p className="text-sm text-muted-foreground">
                          {location.conversions} conversions
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Device Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Device Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockData.devices.map((device, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {device.device === 'Mobile' && <Smartphone className="h-4 w-4" />}
                          {device.device === 'Desktop' && <Monitor className="h-4 w-4" />}
                          {device.device === 'Tablet' && <Monitor className="h-4 w-4" />}
                          <span className="font-medium">{device.device}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{device.percentage}%</span>
                      </div>
                      <Progress value={device.percentage} className="h-2" />
                      <div className="text-sm text-muted-foreground">
                        {formatNumber(device.clicks)} clicks • {device.conversions} conversions
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Optimization Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Increase budget for "Hair Cutting Services" campaign by 25% to capture more traffic
                  </AlertDescription>
                </Alert>
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Add negative keywords to reduce irrelevant clicks by 15%
                  </AlertDescription>
                </Alert>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Optimize ad copy for mobile devices to improve CTR by 12%
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-green-50 rounded-md">
                  <p className="text-sm font-medium text-green-800">Best Performing Hour</p>
                  <p className="text-sm text-green-600">2 PM - 4 PM (32% higher CTR)</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-md">
                  <p className="text-sm font-medium text-blue-800">Top Converting Day</p>
                  <p className="text-sm text-blue-600">Thursday (24% higher conversion rate)</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-md">
                  <p className="text-sm font-medium text-purple-800">Audience Insight</p>
                  <p className="text-sm text-purple-600">25-35 age group shows 40% higher engagement</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-red-500" />
                  A/B Test Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 border rounded-md">
                  <p className="text-sm font-medium">Ad Copy Test</p>
                  <p className="text-sm text-muted-foreground">Variant B performing 18% better</p>
                  <Progress value={72} className="mt-2" />
                </div>
                <div className="p-3 border rounded-md">
                  <p className="text-sm font-medium">Landing Page Test</p>
                  <p className="text-sm text-muted-foreground">Version A shows 23% higher conversions</p>
                  <Progress value={81} className="mt-2" />
                </div>
                <div className="p-3 border rounded-md">
                  <p className="text-sm font-medium">Bid Strategy Test</p>
                  <p className="text-sm text-muted-foreground">Automated bidding reduces CPC by 12%</p>
                  <Progress value={65} className="mt-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
});

GoogleAdsTab.displayName = 'GoogleAdsTab';

export default GoogleAdsTab; 