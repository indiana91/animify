import React, { useState } from 'react';
import { Link } from 'wouter';
import { MoreHorizontal, Search, RefreshCw, FileVideo, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { useAnimations } from '@/hooks/useAnimations';

const History: React.FC = () => {
  const { animations, isLoadingAnimations } = useAnimations();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter animations based on search query
  const filteredAnimations = animations?.filter(animation => 
    animation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    animation.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <MainLayout>
      <div className="py-6">
        <div className="max-w-full mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Animation History</h1>
        </div>
        
        <div className="max-w-full mx-auto px-4 sm:px-6 md:px-8">
          {/* Search and Actions */}
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full sm:max-w-xs">
              <form onSubmit={(e) => e.preventDefault()}>
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="search"
                    name="search"
                    className="block w-full pl-10 pr-3 py-2"
                    placeholder="Search animations"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
            </div>
            
            <Button className="shrink-0" onClick={() => setSearchQuery('')}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
          
          {/* Animations Table */}
          <Card className="mt-6">
            <CardContent className="p-0">
              {isLoadingAnimations ? (
                <div className="flex justify-center items-center py-24">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredAnimations.length > 0 ? (
                <Table>
                  <TableCaption>
                    Showing {filteredAnimations.length} {filteredAnimations.length === 1 ? 'animation' : 'animations'}
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>AI Model</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAnimations.map((animation) => (
                      <TableRow key={animation.id}>
                        <TableCell>
                          <div className="flex items-center">
                            {getStatusIcon(animation.status)}
                            <span className="ml-2 capitalize">{animation.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{animation.title}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {animation.prompt}
                          </div>
                        </TableCell>
                        <TableCell>
                          {animation.aiModel === 'openai' ? 'OpenAI GPT-4' : 
                           animation.aiModel === 'gemini' ? 'Google Gemini' : 
                           animation.aiModel === 'groq' ? 'Groq' : animation.aiModel}
                        </TableCell>
                        <TableCell>{formatDate(animation.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Link href={`/generate/${animation.id}`}>
                                  <a className="w-full flex items-center">
                                    <FileVideo className="mr-2 h-4 w-4" />
                                    View Details
                                  </a>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Link href={`/generate/${animation.id}/edit`}>
                                  <a className="w-full flex items-center">
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Regenerate
                                  </a>
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <FileVideo className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No animations found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {searchQuery ? 'Try a different search term or' : 'Get started by creating your first animation.'}
                  </p>
                  <div className="mt-6">
                    <Link href="/generate">
                      <Button>
                        <FileVideo className="mr-2 h-4 w-4" />
                        New Animation
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default History;
