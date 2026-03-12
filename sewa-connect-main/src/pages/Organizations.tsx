import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, Plus, Building2, Loader2, MapPin, Users, Heart, X } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { OrganizationCard } from '@/components/organizations/OrganizationCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Organization, OrganizationSector, SECTOR_LABELS, ApiOrganization, mapApiToOrganization, mapSectorToTypeId, SewaGroup } from '@/types/organization';
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { GroupCard } from '@/components/home/GroupCard';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const sectors: OrganizationSector[] = [
  'old_age_home',
  'cow_shelter',
  'orphanage',
  'animal_care',
  'education',
  'medical_aid',
  'other',
];

export default function Organizations() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [groups, setGroups] = useState<SewaGroup[]>([]);
  const [filterType, setFilterType] = useState<'organizations' | 'groups'>('organizations');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>(searchParams.get('sector') || 'all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [cities, setCities] = useState<string[]>([]);
  const [isCityFilterOpen, setIsCityFilterOpen] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [preferredCity, setPreferredCity] = useState(localStorage.getItem('preferredCity') || 'Ahmedabad');
  const PAGE_SIZE = 12;

  const { user } = useAuth();

  const capitalize = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';

  useEffect(() => {
    const handleCityChange = () => {
      setPreferredCity(localStorage.getItem('preferredCity') || 'Ahmedabad');
      setPage(1);
    };
    window.addEventListener('cityChanged', handleCityChange);
    return () => window.removeEventListener('cityChanged', handleCityChange);
  }, []);

  useEffect(() => {
    if (filterType === 'organizations') {
      fetchOrganizations();
    } else {
      fetchGroups();
    }
  }, [page, selectedSector, searchQuery, selectedCity, preferredCity, filterType, showFavoritesOnly]);

  const fetchOrganizations = async () => {
    setIsLoading(true);
    try {
      let currentFavoriteIds: number[] = [];
      if (user) {
        const { data } = await api.get('/Favorites');
        currentFavoriteIds = data;
        setFavoriteIds(data);
      }

      if (showFavoritesOnly && user) {
        if (currentFavoriteIds.length === 0) {
          setOrganizations([]);
          setTotalPages(0);
          setIsLoading(false);
          return;
        }
      }

      const params: any = {
        page,
        pageSize: PAGE_SIZE,
        preferredCity: preferredCity
      };

      if (selectedSector !== 'all') {
        params.typeId = mapSectorToTypeId(selectedSector as OrganizationSector);
      }
      if (searchQuery) {
        params.search = searchQuery;
      }
      if (selectedCity !== 'all') {
        params.city = selectedCity;
      }

      const response = await api.get('/organizations/list', { params });
      let { items, totalItems } = response.data;

      // Client-side filtering for favorites if needed
      // (Better to do this on server, but this works for now given the list sizes)
      if (showFavoritesOnly) {
        items = items.filter((org: ApiOrganization) => currentFavoriteIds.includes(org.organizationId));
        totalItems = items.length;
      }

      const mappedOrgs = (items || []).map(mapApiToOrganization);
      setOrganizations(mappedOrgs);
      setTotalPages(Math.ceil((totalItems || 0) / PAGE_SIZE));

      // Update cities filter list baseline from current organizations
      const uniqueCities = [...new Set(mappedOrgs.map((org: Organization) => org.city.toLowerCase()))].filter(Boolean).sort() as string[];
      if (uniqueCities.length > 0) {
        setCities(prev => [...new Set([...prev, ...uniqueCities])].sort());
      }

    } catch (error) {
      console.error('Error fetching organizations:', error);
      setOrganizations([]);
    }
    setIsLoading(false);
  };

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      // Default search with city if selectedCity is set or we have a preferredCity
      const cityToFilter = selectedCity !== 'all' ? selectedCity : preferredCity;

      const params: any = {
        search: searchQuery,
        city: cityToFilter
      };

      let response = await api.get('/Groups', { params });
      let groupsData = response.data;

      // Fallback: If no groups found in the specific city, show ALL groups
      // but only if we are in the "All Cities" mode (selectedCity === 'all')
      if (groupsData.length === 0 && selectedCity === 'all') {
        const fallbackResponse = await api.get('/Groups', {
          params: { search: searchQuery }
        });
        groupsData = fallbackResponse.data;
      }

      setGroups(groupsData);
      setTotalPages(1);

      // Update cities filter list from groups
      const groupCities = [...new Set((groupsData || []).map((g: any) => g.city?.toLowerCase()))].filter(Boolean).sort() as string[];
      if (groupCities.length > 0) {
        setCities(prev => [...new Set([...prev, ...groupCities])].sort());
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      setGroups([]);
    }
    setIsLoading(false);
  };

  const handleSectorChange = (value: string) => {
    setSelectedSector(value);
    setPage(1);
    if (value === 'all') {
      searchParams.delete('sector');
    } else {
      searchParams.set('sector', value);
    }
    setSearchParams(searchParams);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
                {filterType === 'organizations' ? 'Organizations' : 'Sewa Groups'}
              </h1>
              <p className="text-muted-foreground">
                {filterType === 'organizations'
                  ? 'Discover and support verified non-profit organizations across India'
                  : 'Connect with local teams of volunteers ready to help with specific causes'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => user ? navigate('/groups/register') : navigate('/auth', { state: { from: { pathname: '/groups/register' } } })}
                className="flex-1 sm:flex-none"
              >
                <Plus className="w-4 h-4 mr-2" />
                Register Group
              </Button>
              <Button
                size="sm"
                onClick={() => user ? navigate('/organizations/add') : navigate('/auth', { state: { from: { pathname: '/organizations/add' } } })}
                className="flex-1 sm:flex-none"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Organization
              </Button>
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`flex-1 sm:flex-none transition-all border-2 ${showFavoritesOnly
                      ? 'bg-red-500 hover:bg-red-600 text-white border-red-500'
                      : 'bg-white text-red-500 border-red-200 hover:bg-red-50 hover:border-red-500 hover:text-red-600'
                    }`}
                >
                  <Heart className={`w-4 h-4 mr-2 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                  {showFavoritesOnly ? 'My Favorites' : 'Show Favorites'}
                </Button>
              )}
            </div>
          </div>

          <div className="bg-card rounded-2xl p-4 md:p-6 shadow-soft border border-border mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={filterType === 'organizations' ? "Search organizations..." : "Search help groups..."}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setPage(1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <Tabs
                value={filterType}
                onValueChange={(val) => {
                  setFilterType(val as any);
                  setPage(1);
                }}
                className="w-full md:w-auto"
              >
                <TabsList className="grid w-full lg:w-80 grid-cols-2">
                  <TabsTrigger value="organizations" className="font-bold">NGOs</TabsTrigger>
                  <TabsTrigger value="groups" className="font-bold">Sewa Groups</TabsTrigger>
                </TabsList>
              </Tabs>

              {filterType === 'organizations' && (
                <Select value={selectedSector} onValueChange={handleSectorChange}>
                  <SelectTrigger className="w-full md:w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="All Sectors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sectors</SelectItem>
                    {sectors.map((sector) => (
                      <SelectItem key={sector} value={sector}>
                        {SECTOR_LABELS[sector]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Popover open={isCityFilterOpen} onOpenChange={setIsCityFilterOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isCityFilterOpen}
                    className="w-full md:w-48 justify-between h-10 px-3"
                  >
                    <div className="flex items-center truncate">
                      <MapPin className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />
                      {selectedCity === 'all'
                        ? "All Cities"
                        : capitalize(selectedCity)}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search city..." />
                    <CommandList>
                      <CommandEmpty>No city found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="all"
                          onSelect={() => {
                            setSelectedCity("all")
                            setIsCityFilterOpen(false)
                            setPage(1)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCity === "all" ? "opacity-100" : "opacity-0"
                            )}
                          />
                          All Cities
                        </CommandItem>
                        {cities.map((city) => (
                          <CommandItem
                            key={city}
                            value={city}
                            onSelect={(currentValue) => {
                              setSelectedCity(currentValue)
                              setIsCityFilterOpen(false)
                              setPage(1)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCity.toLowerCase() === city.toLowerCase() ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {capitalize(city)}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (filterType === 'organizations' ? organizations.length : groups.length) > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
              {filterType === 'organizations'
                ? organizations.map((org) => (
                  <OrganizationCard
                    key={org.id}
                    organization={org}
                    isFavoriteInitial={favoriteIds.includes(Number(org.id))}
                  />
                ))
                : groups.map((group) => (
                  <GroupCard key={group.groupId} group={group} onUpdate={fetchGroups} />
                ))
              }
            </div>
          ) : (
            <div className="text-center py-20 bg-card/50 rounded-3xl border border-dashed border-border">
              {filterType === 'organizations' ? (
                <>
                  <Building2 className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                    No organizations found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your filters or search query
                  </p>
                  <Button onClick={() => user ? navigate('/organizations/add') : navigate('/auth', { state: { from: { pathname: '/organizations/add' } } })}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Organization
                  </Button>
                </>
              ) : (
                <>
                  <Users className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                    No Sewa Groups found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Be the first to create a help group in this area!
                  </p>
                  <Button onClick={() => user ? navigate('/groups/register') : navigate('/auth', { state: { from: { pathname: '/groups/register' } } })}>
                    <Plus className="w-4 h-4 mr-2" />
                    Register Sewa Group
                  </Button>
                </>
              )}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm font-medium">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </main >

      <Footer />
    </div >
  );
}
