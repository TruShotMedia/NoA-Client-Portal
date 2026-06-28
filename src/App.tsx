import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CalendarPlus,
  Check,
  ClipboardList,
  Copy,
  ExternalLink,
  FileText,
  FolderOpen,
  KeyRound,
  LineChart,
  Link as LinkIcon,
  Mail,
  Menu,
  PackagePlus,
  Phone,
  Plus,
  Send,
  Sparkles,
  Trash2,
  TrendingUp,
  UserRound,
  X,
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { FormEvent, ReactNode, TouchEvent } from 'react'
import { useEffect, useState } from 'react'
import './App.css'
import { isSupabaseConfigured, supabase } from './supabaseClient'

type ClientStatus =
  | 'Draft'
  | 'Proposal Sent'
  | 'Viewed'
  | 'Package Selected'
  | 'Ready To Invoice'
  | 'Invoiced'
  | 'Active'

type BillingCycle = 'one-off' | 'monthly' | 'setup + monthly'

type PackageOption = {
  id: string
  name: string
  summary: string
  price: number
  cycle: BillingCycle
  setupFee?: number
  recommended?: boolean
  features: string[]
}

type AssetLink = {
  id: string
  title: string
  url: string
  type: string
  addedAt: string
}

type CampaignRequest = {
  id: string
  title: string
  dueDate: string
  notes: string
  status: 'New' | 'Planning' | 'Assets Sent' | 'Complete'
}

type Selection = {
  packageId: string
  submittedAt: string
  contactName: string
  email: string
  phone: string
  billingName: string
  abn: string
  invoiceNotes: string
}

type Client = {
  id: string
  name: string
  slug: string
  contactName: string
  email: string
  phone: string
  portalUsername: string
  portalPassword: string
  status: ClientStatus
  proposalIntro: string
  auditNotes: string[]
  packages: PackageOption[]
  selection?: Selection
  assets: AssetLink[]
  campaigns: CampaignRequest[]
}

type SupabaseClientRow = {
  id: string
  business_name: string
  slug: string
  contact_name: string
  email: string
  phone: string
  status: ClientStatus
  portal_username: string
  portal_access_code_hint: string | null
}

type SupabaseProposalRow = {
  id: string
  client_id: string
  slug: string
  business_name: string
  intro: string
  audit_notes: string[]
  is_public: boolean
}

type SupabasePackageRow = {
  id: string
  proposal_id: string
  name: string
  summary: string
  price: number
  cycle: BillingCycle
  setup_fee: number | null
  recommended: boolean
  features: string[]
  sort_order: number
}

type SupabaseSelectionRow = {
  proposal_id: string
  package_id: string
  submitted_at: string
  contact_name: string
  email: string
  phone: string
  billing_name: string
  abn: string
  invoice_notes: string
}

type SupabaseAssetRow = {
  id: string
  client_id: string
  title: string
  url: string
  type: string
  added_at: string
}

type SupabaseCampaignRow = {
  id: string
  client_id: string
  title: string
  due_date: string | null
  notes: string
  status: CampaignRequest['status']
}

const statusOrder: ClientStatus[] = [
  'Draft',
  'Proposal Sent',
  'Viewed',
  'Package Selected',
  'Ready To Invoice',
  'Invoiced',
  'Active',
]

const defaultPackages: PackageOption[] = [
  {
    id: 'starter',
    name: 'Social Starter',
    summary: 'Clean up the basics and create a consistent posting rhythm.',
    price: 650,
    cycle: 'one-off',
    features: [
      'Social profile review',
      'Bio and page tidy-up',
      '10 post ideas',
      'Starter content calendar',
      'One revision round',
    ],
  },
  {
    id: 'growth',
    name: 'Growth Retainer',
    summary: 'Ongoing content support for businesses ready to show up weekly.',
    price: 950,
    cycle: 'monthly',
    recommended: true,
    features: [
      'Monthly content plan',
      '12 social posts per month',
      'Caption writing',
      'Asset organisation',
      'Monthly performance notes',
    ],
  },
  {
    id: 'campaign',
    name: 'Launch Campaign',
    summary: 'A focused campaign for a sale, opening, event, or promotion.',
    price: 1200,
    cycle: 'setup + monthly',
    setupFee: 400,
    features: [
      'Campaign concept',
      'Offer positioning',
      '18 campaign assets',
      'Launch timeline',
      'Two revision rounds',
    ],
  },
]

const starterClients: Client[] = [
  {
    id: 'client-coastal',
    name: 'Coastal Cafe Co.',
    slug: 'coastal-cafe-co',
    contactName: 'Mia Taylor',
    email: 'mia@coastalcafe.example',
    phone: '0400 111 222',
    portalUsername: 'coastal-cafe-co',
    portalPassword: 'NCP-7KQ4-L9R2',
    status: 'Proposal Sent',
    proposalIntro:
      'I reviewed your Instagram and Facebook presence and found a clear opportunity to make the page feel more consistent, seasonal, and easier for locals to act on.',
    auditNotes: [
      'Strong product photos, but the posting rhythm is inconsistent.',
      'Highlights could better explain menus, hours, events, and catering.',
      'There is room to turn weekly specials into repeatable campaign assets.',
    ],
    packages: defaultPackages,
    assets: [
      {
        id: 'asset-1',
        title: 'Initial audit notes',
        url: 'https://drive.google.com/',
        type: 'Google Drive',
        addedAt: '2026-06-28',
      },
    ],
    campaigns: [
      {
        id: 'campaign-1',
        title: 'Winter menu push',
        dueDate: '2026-07-12',
        notes: 'Client wants content around soups, coffee bundles, and weekend foot traffic.',
        status: 'Planning',
      },
    ],
  },
  {
    id: 'client-peak',
    name: 'Peak Plumbing',
    slug: 'peak-plumbing',
    contactName: 'Jack Martin',
    email: 'jack@peakplumbing.example',
    phone: '0400 333 444',
    portalUsername: 'peak-plumbing',
    portalPassword: 'NCP-3VHD-8P2X',
    status: 'Ready To Invoice',
    proposalIntro:
      'Your page already has trust signals. The biggest win is packaging those jobs into clearer proof, regular updates, and stronger call-to-action posts.',
    auditNotes: [
      'Before-and-after work should be turned into recurring proof posts.',
      'Emergency services need clearer visual priority.',
      'Reviews and service areas can be reused across monthly content.',
    ],
    packages: defaultPackages,
    selection: {
      packageId: 'growth',
      submittedAt: '2026-06-27',
      contactName: 'Jack Martin',
      email: 'jack@peakplumbing.example',
      phone: '0400 333 444',
      billingName: 'Peak Plumbing Pty Ltd',
      abn: '12 345 678 900',
      invoiceNotes: 'Invoice monthly retainer from July.',
    },
    assets: [],
    campaigns: [],
  },
]

const emptyClient = (): Client => ({
  id: crypto.randomUUID(),
  name: 'New Client',
  slug: `new-client-${Date.now().toString().slice(-4)}`,
  contactName: '',
  email: '',
  phone: '',
  portalUsername: `new-client-${Date.now().toString().slice(-4)}`,
  portalPassword: generatePortalPassword(),
  status: 'Draft',
  proposalIntro:
    'I reviewed your social media presence and found a few practical opportunities to improve consistency, clarity, and conversion.',
  auditNotes: [
    'Profile structure can be made clearer for new visitors.',
    'Content can be planned around repeatable weekly themes.',
    'Campaigns can be packaged more deliberately around offers and events.',
  ],
  packages: defaultPackages.map((pkg) => ({ ...pkg, id: crypto.randomUUID() })),
  assets: [],
  campaigns: [],
})

function generatePortalPassword() {
  const parts = Array.from({ length: 2 }, () =>
    Math.random().toString(36).slice(2, 6).toUpperCase(),
  )
  return `NCP-${parts.join('-')}`
}

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const ensureUuid = (value: string) =>
  uuidPattern.test(value) ? value : crypto.randomUUID()

function normalizeClient(client: Client): Client {
  const fallbackSlug = client.slug || slugify(client.name) || `client-${Date.now()}`
  const packageIdMap = new Map<string, string>()
  const packages = client.packages.map((pkg) => {
    const id = ensureUuid(pkg.id)
    packageIdMap.set(pkg.id, id)
    return { ...pkg, id }
  })

  return {
    ...client,
    id: ensureUuid(client.id),
    slug: fallbackSlug,
    portalUsername: client.portalUsername || fallbackSlug,
    portalPassword: client.portalPassword || generatePortalPassword(),
    packages,
    selection: client.selection
      ? {
          ...client.selection,
          packageId:
            packageIdMap.get(client.selection.packageId) ?? client.selection.packageId,
        }
      : undefined,
    assets: client.assets.map((asset) => ({ ...asset, id: ensureUuid(asset.id) })),
    campaigns: client.campaigns.map((campaign) => ({
      ...campaign,
      id: ensureUuid(campaign.id),
    })),
  }
}

const money = (value: number) =>
  new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  }).format(value)

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const cycleLabel = (pkg: PackageOption) => {
  if (pkg.cycle === 'setup + monthly') {
    return `${money(pkg.setupFee ?? 0)} setup + ${money(pkg.price)}/mo`
  }
  return pkg.cycle === 'monthly' ? `${money(pkg.price)}/mo` : money(pkg.price)
}

function loadClients() {
  const saved = localStorage.getItem('noa-client-portal-data')
  if (!saved) return starterClients.map(normalizeClient)

  try {
    return (JSON.parse(saved) as Client[]).map(normalizeClient)
  } catch {
    return starterClients.map(normalizeClient)
  }
}

async function hashAccessCode(value: string) {
  const bytes = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function mapSupabaseBundleToClients({
  assets,
  campaigns,
  clients,
  packages,
  proposals,
  selections,
}: {
  assets: SupabaseAssetRow[]
  campaigns: SupabaseCampaignRow[]
  clients: SupabaseClientRow[]
  packages: SupabasePackageRow[]
  proposals: SupabaseProposalRow[]
  selections: SupabaseSelectionRow[]
}) {
  return clients.map((client): Client => {
    const proposal = proposals.find((item) => item.client_id === client.id)
    const proposalPackages = proposal
      ? packages
          .filter((pkg) => pkg.proposal_id === proposal.id)
          .sort((a, b) => a.sort_order - b.sort_order)
      : []
    const selection = proposal
      ? selections.find((item) => item.proposal_id === proposal.id)
      : undefined

    return normalizeClient({
      id: client.id,
      name: client.business_name,
      slug: client.slug,
      contactName: client.contact_name,
      email: client.email,
      phone: client.phone,
      portalUsername: client.portal_username,
      portalPassword: client.portal_access_code_hint ?? 'Saved securely',
      status: client.status,
      proposalIntro: proposal?.intro ?? '',
      auditNotes: proposal?.audit_notes ?? [],
      packages: proposalPackages.map((pkg) => ({
        id: pkg.id,
        name: pkg.name,
        summary: pkg.summary,
        price: Number(pkg.price),
        cycle: pkg.cycle,
        setupFee: pkg.setup_fee ?? undefined,
        recommended: pkg.recommended,
        features: pkg.features,
      })),
      selection: selection
        ? {
            packageId: selection.package_id,
            submittedAt: selection.submitted_at.slice(0, 10),
            contactName: selection.contact_name,
            email: selection.email,
            phone: selection.phone,
            billingName: selection.billing_name,
            abn: selection.abn,
            invoiceNotes: selection.invoice_notes,
          }
        : undefined,
      assets: assets
        .filter((asset) => asset.client_id === client.id)
        .map((asset) => ({
          id: asset.id,
          title: asset.title,
          url: asset.url,
          type: asset.type,
          addedAt: asset.added_at,
        })),
      campaigns: campaigns
        .filter((campaign) => campaign.client_id === client.id)
        .map((campaign) => ({
          id: campaign.id,
          title: campaign.title,
          dueDate: campaign.due_date ?? '',
          notes: campaign.notes,
          status: campaign.status,
        })),
    })
  })
}

async function loadClientsFromSupabase(userId: string) {
  if (!supabase) return []

  const { data: clients, error: clientsError } = await supabase
    .from('noa_client_portal_clients')
    .select('*')
    .eq('owner_user_id', userId)
    .order('created_at', { ascending: false })
  if (clientsError) throw clientsError

  const clientIds = (clients ?? []).map((client) => client.id)
  if (clientIds.length === 0) return []

  const [
    { data: proposals, error: proposalsError },
    { data: assets, error: assetsError },
    { data: campaigns, error: campaignsError },
  ] = await Promise.all([
    supabase
      .from('noa_client_portal_proposals')
      .select('*')
      .in('client_id', clientIds),
    supabase
      .from('noa_client_portal_asset_links')
      .select('*')
      .in('client_id', clientIds),
    supabase
      .from('noa_client_portal_campaign_requests')
      .select('*')
      .in('client_id', clientIds),
  ])
  if (proposalsError) throw proposalsError
  if (assetsError) throw assetsError
  if (campaignsError) throw campaignsError

  const proposalIds = (proposals ?? []).map((proposal) => proposal.id)
  const [{ data: packages, error: packagesError }, { data: selections, error: selectionsError }] =
    proposalIds.length
      ? await Promise.all([
          supabase
            .from('noa_client_portal_packages')
            .select('*')
            .in('proposal_id', proposalIds),
          supabase
            .from('noa_client_portal_selections')
            .select('*')
            .in('proposal_id', proposalIds),
        ])
      : [
          { data: [], error: null },
          { data: [], error: null },
        ]
  if (packagesError) throw packagesError
  if (selectionsError) throw selectionsError

  return mapSupabaseBundleToClients({
    assets: (assets ?? []) as SupabaseAssetRow[],
    campaigns: (campaigns ?? []) as SupabaseCampaignRow[],
    clients: (clients ?? []) as SupabaseClientRow[],
    packages: (packages ?? []) as SupabasePackageRow[],
    proposals: (proposals ?? []) as SupabaseProposalRow[],
    selections: (selections ?? []) as SupabaseSelectionRow[],
  })
}

async function saveClientToSupabase(client: Client, userId: string) {
  if (!supabase) return
  const normalized = normalizeClient(client)
  const accessCodeHash = await hashAccessCode(normalized.portalPassword)

  const { error: clientError } = await supabase
    .from('noa_client_portal_clients')
    .upsert({
      id: normalized.id,
      owner_user_id: userId,
      business_name: normalized.name,
      slug: normalized.slug,
      contact_name: normalized.contactName,
      email: normalized.email,
      phone: normalized.phone,
      status: normalized.status,
      portal_username: normalized.portalUsername,
      portal_access_code_hash: accessCodeHash,
      portal_access_code_hint: normalized.portalPassword.slice(-4),
    })
  if (clientError) throw clientError

  const { data: proposal, error: proposalError } = await supabase
    .from('noa_client_portal_proposals')
    .upsert(
      {
        client_id: normalized.id,
        slug: normalized.slug,
        business_name: normalized.name,
        intro: normalized.proposalIntro,
        audit_notes: normalized.auditNotes,
        is_public: true,
      },
      { onConflict: 'client_id' },
    )
    .select('id')
    .single()
  if (proposalError) throw proposalError

  const proposalId = proposal.id as string

  const { error: packagesError } = await supabase
    .from('noa_client_portal_packages')
    .upsert(
      normalized.packages.map((pkg, index) => ({
        id: pkg.id,
        proposal_id: proposalId,
        name: pkg.name,
        summary: pkg.summary,
        price: pkg.price,
        cycle: pkg.cycle,
        setup_fee: pkg.setupFee ?? null,
        recommended: Boolean(pkg.recommended),
        features: pkg.features,
        sort_order: index,
      })),
    )
  if (packagesError) throw packagesError

  if (normalized.assets.length) {
    const { error: assetsError } = await supabase
      .from('noa_client_portal_asset_links')
      .upsert(
        normalized.assets.map((asset) => ({
          id: asset.id,
          client_id: normalized.id,
          title: asset.title,
          url: asset.url,
          type: asset.type,
          added_at: asset.addedAt,
        })),
      )
    if (assetsError) throw assetsError
  }

  if (normalized.campaigns.length) {
    const { error: campaignsError } = await supabase
      .from('noa_client_portal_campaign_requests')
      .upsert(
        normalized.campaigns.map((campaign) => ({
          id: campaign.id,
          client_id: normalized.id,
          title: campaign.title,
          due_date: campaign.dueDate || null,
          notes: campaign.notes,
          status: campaign.status,
        })),
      )
    if (campaignsError) throw campaignsError
  }

  if (normalized.selection) {
    const { error: selectionError } = await supabase
      .from('noa_client_portal_selections')
      .insert({
        proposal_id: proposalId,
        package_id: normalized.selection.packageId,
        contact_name: normalized.selection.contactName,
        email: normalized.selection.email,
        phone: normalized.selection.phone,
        billing_name: normalized.selection.billingName,
        abn: normalized.selection.abn,
        invoice_notes: normalized.selection.invoiceNotes,
        submitted_at: normalized.selection.submittedAt,
      })
    if (selectionError && selectionError.code !== '23505') throw selectionError
  }
}

async function loadPublicProposalFromSupabase(slug: string) {
  if (!supabase) return null
  const { data: proposal, error: proposalError } = await supabase
    .from('noa_client_portal_proposals')
    .select('*')
    .eq('slug', slug)
    .eq('is_public', true)
    .single()
  if (proposalError || !proposal) return null

  const { data: packages, error: packagesError } = await supabase
    .from('noa_client_portal_packages')
    .select('*')
    .eq('proposal_id', proposal.id)
    .order('sort_order', { ascending: true })
  if (packagesError) throw packagesError

  return normalizeClient({
    id: proposal.client_id,
    name: proposal.business_name,
    slug: proposal.slug,
    contactName: '',
    email: '',
    phone: '',
    portalUsername: proposal.slug,
    portalPassword: 'Portal access issued separately',
    status: 'Proposal Sent',
    proposalIntro: proposal.intro,
    auditNotes: proposal.audit_notes ?? [],
    packages: ((packages ?? []) as SupabasePackageRow[]).map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
      summary: pkg.summary,
      price: Number(pkg.price),
      cycle: pkg.cycle,
      setupFee: pkg.setup_fee ?? undefined,
      recommended: pkg.recommended,
      features: pkg.features,
    })),
    assets: [],
    campaigns: [],
  })
}

async function submitSelectionToSupabase(
  slug: string,
  packageId: string,
  selection: Omit<Selection, 'packageId'>,
) {
  if (!supabase) return
  const { data: proposal, error: proposalError } = await supabase
    .from('noa_client_portal_proposals')
    .select('id')
    .eq('slug', slug)
    .eq('is_public', true)
    .single()
  if (proposalError || !proposal) throw proposalError

  const { error } = await supabase.from('noa_client_portal_selections').insert({
    proposal_id: proposal.id,
    package_id: packageId,
    contact_name: selection.contactName,
    email: selection.email,
    phone: selection.phone,
    billing_name: selection.billingName,
    abn: selection.abn,
    invoice_notes: selection.invoiceNotes,
    submitted_at: selection.submittedAt,
  })
  if (error) throw error
}

function App() {
  const [clients, setClients] = useState<Client[]>(loadClients)
  const [selectedId, setSelectedId] = useState(clients[0]?.id ?? '')
  const [activeView, setActiveView] = useState<
    'dashboard' | 'client' | 'proposal' | 'portal'
  >('dashboard')
  const [copied, setCopied] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [dragOffset, setDragOffset] = useState(0)
  const [user, setUser] = useState<User | null>(null)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [cloudStatus, setCloudStatus] = useState(
    isSupabaseConfigured ? 'Supabase ready' : 'Local mode',
  )
  const [remoteRouteClient, setRemoteRouteClient] = useState<Client | null>(null)

  useEffect(() => {
    localStorage.setItem('noa-client-portal-data', JSON.stringify(clients))
  }, [clients])

  useEffect(() => {
    if (!supabase) return

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const route = window.location.pathname.split('/').filter(Boolean)
  const routeMode = route[0]
  const routeSlug = route[1]
  const routedClient = clients.find((client) => client.slug === routeSlug)

  useEffect(() => {
    if (!routeSlug || routeMode !== 'proposal' || routedClient) return

    loadPublicProposalFromSupabase(routeSlug)
      .then(setRemoteRouteClient)
      .catch((error) =>
        setCloudStatus(error instanceof Error ? error.message : 'Could not load proposal'),
      )
  }, [routeMode, routeSlug, routedClient])

  const selectedClient =
    clients.find((client) => client.id === selectedId) ?? clients[0]

  const updateClient = (id: string, nextClient: Partial<Client>) => {
    setClients((current) =>
      current.map((client) =>
        client.id === id ? { ...client, ...nextClient } : client,
      ),
    )
  }

  const addClient = () => {
    const client = emptyClient()
    setClients((current) => [client, ...current])
    setSelectedId(client.id)
    setActiveView('client')
    setIsSidebarOpen(false)
  }

  const deleteClient = async (id: string) => {
    const client = clients.find((item) => item.id === id)
    if (!client) return
    const confirmed = window.confirm(`Delete ${client.name}? This removes it from this local prototype.`)
    if (!confirmed) return

    if (supabase && user) {
      const { error } = await supabase
        .from('noa_client_portal_clients')
        .delete()
        .eq('id', id)
        .eq('owner_user_id', user.id)
      setCloudStatus(error ? error.message : `Deleted ${client.name}`)
      if (error) return
    }

    setClients((current) => {
      const remaining = current.filter((item) => item.id !== id)
      if (remaining.length === 0) {
        const replacement = emptyClient()
        setSelectedId(replacement.id)
        setActiveView('client')
        return [replacement]
      }
      if (selectedId === id) {
        setSelectedId(remaining[0].id)
        setActiveView('client')
      }
      return remaining
    })
  }

  const proposalUrl = (client: Client) =>
    `${window.location.origin}/proposal/${client.slug}`

  const portalUrl = (client: Client) =>
    `${window.location.origin}/portal/${client.slug}`

  const copyLink = async (label: string, value: string) => {
    await navigator.clipboard.writeText(value)
    setCopied(label)
    window.setTimeout(() => setCopied(''), 1800)
  }

  const signInToSupabase = async (event: FormEvent) => {
    event.preventDefault()
    if (!supabase) return
    setCloudStatus('Signing in...')
    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword,
    })
    setCloudStatus(error ? error.message : 'Signed in')
  }

  const loadCloudClients = async () => {
    if (!user) return
    setCloudStatus('Loading from Supabase...')
    try {
      const cloudClients = await loadClientsFromSupabase(user.id)
      if (cloudClients.length) {
        setClients(cloudClients)
        setSelectedId(cloudClients[0].id)
        setActiveView('dashboard')
      }
      setCloudStatus(
        cloudClients.length
          ? `Loaded ${cloudClients.length} client records`
          : 'No Supabase records yet',
      )
    } catch (error) {
      setCloudStatus(error instanceof Error ? error.message : 'Cloud load failed')
    }
  }

  const saveSelectedCloudClient = async () => {
    if (!user || !selectedClient) return
    setCloudStatus(`Saving ${selectedClient.name}...`)
    try {
      await saveClientToSupabase(selectedClient, user.id)
      setCloudStatus(`Saved ${selectedClient.name}`)
    } catch (error) {
      setCloudStatus(error instanceof Error ? error.message : 'Cloud save failed')
    }
  }

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    const startX = event.touches[0].clientX
    if (isSidebarOpen || startX < 28) {
      setTouchStartX(startX)
      setDragOffset(0)
    }
  }

  const handleTouchMove = (event: TouchEvent<HTMLElement>) => {
    if (touchStartX === null) return
    const currentX = event.touches[0].clientX
    const delta = currentX - touchStartX
    setDragOffset(
      isSidebarOpen
        ? Math.max(-292, Math.min(0, delta))
        : Math.max(0, Math.min(292, delta)),
    )
  }

  const handleTouchEnd = () => {
    if (touchStartX === null) return
    if (isSidebarOpen) {
      setIsSidebarOpen(dragOffset > -96)
    } else {
      setIsSidebarOpen(dragOffset > 96)
    }
    setTouchStartX(null)
    setDragOffset(0)
  }

  const proposalRouteClient = routedClient ?? remoteRouteClient

  if (routeMode === 'proposal' && proposalRouteClient) {
    return (
      <ProposalPage
        client={proposalRouteClient}
        onBack={() => history.pushState(null, '', '/')}
        onSelectPackage={async (packageId, selection) => {
          if (routedClient) {
            updateClient(routedClient.id, {
              status: 'Ready To Invoice',
              selection: { packageId, ...selection },
            })
            return
          }
          await submitSelectionToSupabase(proposalRouteClient.slug, packageId, selection)
        }}
      />
    )
  }

  if (routeMode === 'portal' && routedClient) {
    return <ClientPortal client={routedClient} />
  }

  const metrics = {
    active: clients.filter((client) => client.status === 'Active').length,
    ready: clients.filter((client) => client.status === 'Ready To Invoice').length,
    sent: clients.filter((client) =>
      ['Proposal Sent', 'Viewed', 'Package Selected'].includes(client.status),
    ).length,
    assets: clients.reduce((total, client) => total + client.assets.length, 0),
  }

  return (
    <main
      className={`app-shell ${isSidebarOpen ? 'sidebar-open' : ''}`}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
    >
      <button
        className="sidebar-edge-hit"
        onClick={() => setIsSidebarOpen(true)}
        type="button"
        aria-label="Open navigation"
      />
      <button
        className="sidebar-backdrop"
        onClick={() => setIsSidebarOpen(false)}
        type="button"
        aria-label="Close navigation"
      />
      <aside
        className="sidebar"
        style={{
          transform:
            touchStartX === null
              ? undefined
              : isSidebarOpen
                ? `translateX(${dragOffset}px)`
                : `translateX(calc(-100% + ${dragOffset}px))`,
        }}
      >
        <div className="brand-lockup">
          <div className="brand-mark">N</div>
          <div>
            <strong>NoA Client Portal</strong>
            <span>Proposal command centre</span>
          </div>
          <button
            className="sidebar-close"
            onClick={() => setIsSidebarOpen(false)}
            type="button"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Primary">
          <button
            className={activeView === 'dashboard' ? 'active' : ''}
            onClick={() => {
              setActiveView('dashboard')
              setIsSidebarOpen(false)
            }}
            type="button"
          >
            <BarChart3 size={18} />
            Dashboard
          </button>
        </nav>

        <div className="client-list-header">
          <span>Clients</span>
          <button className="icon-button" onClick={addClient} type="button" title="Add client">
            <Plus size={18} />
          </button>
        </div>

        <div className="client-list">
          {clients.map((client) => (
            <div className="client-nav-group" key={client.id}>
              <button
                className={
                  client.id === selectedClient.id && activeView !== 'dashboard'
                    ? 'client-pill active'
                    : 'client-pill'
                }
                onClick={() => {
                  setSelectedId(client.id)
                  setActiveView('client')
                  setIsSidebarOpen(false)
                }}
                type="button"
              >
                <span>{client.name}</span>
                <small>{client.status}</small>
              </button>
              {client.id === selectedClient.id && activeView !== 'dashboard' && (
                <div className="client-subnav">
                  <button
                    className={activeView === 'client' ? 'active' : ''}
                    onClick={() => {
                      setActiveView('client')
                      setIsSidebarOpen(false)
                    }}
                    type="button"
                  >
                    <UserRound size={15} />
                    Overview
                  </button>
                  <button
                    className={activeView === 'proposal' ? 'active' : ''}
                    onClick={() => {
                      setActiveView('proposal')
                      setIsSidebarOpen(false)
                    }}
                    type="button"
                  >
                    <FileText size={15} />
                    Proposal
                  </button>
                  <button
                    className={activeView === 'portal' ? 'active' : ''}
                    onClick={() => {
                      setActiveView('portal')
                      setIsSidebarOpen(false)
                    }}
                    type="button"
                  >
                    <FolderOpen size={15} />
                    Portal
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Local prototype</p>
            <div className="topbar-title-row">
              <button
                className="mobile-menu-button"
                onClick={() => setIsSidebarOpen(true)}
                type="button"
                aria-label="Open navigation"
              >
                <Menu size={20} />
              </button>
              <h1>{activeView === 'dashboard' ? 'Dashboard' : selectedClient.name}</h1>
            </div>
          </div>
          {activeView === 'dashboard' ? (
            <div />
          ) : (
            <div className="topbar-actions">
              <button
                className="secondary-button"
                onClick={() => copyLink('proposal', proposalUrl(selectedClient))}
                type="button"
              >
                <Copy size={17} />
                {copied === 'proposal' ? 'Copied' : 'Copy proposal'}
              </button>
              <a className="primary-button" href={`/proposal/${selectedClient.slug}`}>
                <ExternalLink size={17} />
                Open proposal
              </a>
            </div>
          )}
        </header>

        <CloudBar
          authEmail={authEmail}
          authPassword={authPassword}
          cloudStatus={cloudStatus}
          isConfigured={isSupabaseConfigured}
          isDashboard={activeView === 'dashboard'}
          user={user}
          onEmailChange={setAuthEmail}
          onLoad={loadCloudClients}
          onPasswordChange={setAuthPassword}
          onSave={saveSelectedCloudClient}
          onSignIn={signInToSupabase}
          onSignOut={async () => {
            await supabase?.auth.signOut()
            setCloudStatus('Signed out')
          }}
        />

        {activeView === 'dashboard' && (
          <DashboardView
            clients={clients}
            metrics={metrics}
          />
        )}

        {activeView === 'client' && (
          <ClientOverview
            client={selectedClient}
            copied={copied}
            onDelete={() => deleteClient(selectedClient.id)}
            onCopyPortal={() => copyLink('portal', portalUrl(selectedClient))}
            onUpdate={updateClient}
          />
        )}

        {activeView === 'proposal' && (
          <ProposalBuilder
            client={selectedClient}
            onCopy={() => copyLink('proposal', proposalUrl(selectedClient))}
            onUpdate={updateClient}
            copied={copied}
          />
        )}

        {activeView === 'portal' && (
          <PortalManager client={selectedClient} onUpdate={updateClient} />
        )}
      </section>
    </main>
  )
}

function CloudBar({
  authEmail,
  authPassword,
  cloudStatus,
  isConfigured,
  isDashboard,
  onEmailChange,
  onLoad,
  onPasswordChange,
  onSave,
  onSignIn,
  onSignOut,
  user,
}: {
  authEmail: string
  authPassword: string
  cloudStatus: string
  isConfigured: boolean
  isDashboard: boolean
  onEmailChange: (value: string) => void
  onLoad: () => void
  onPasswordChange: (value: string) => void
  onSave: () => void
  onSignIn: (event: FormEvent) => void
  onSignOut: () => void
  user: User | null
}) {
  if (!isConfigured) {
    return (
      <section className="cloud-bar">
        <div>
          <p className="eyebrow">Storage</p>
          <strong>Local browser mode</strong>
        </div>
        <span>Add Supabase env values to enable cloud sync.</span>
      </section>
    )
  }

  return (
    <section className="cloud-bar">
      <div>
        <p className="eyebrow">Supabase</p>
        <strong>{user ? user.email : 'Sign in to cloud sync'}</strong>
        <span>{cloudStatus}</span>
      </div>
      {user ? (
        <div className="cloud-actions">
          <button className="secondary-button compact" onClick={onLoad} type="button">
            Load
          </button>
          {!isDashboard && (
            <button className="primary-button compact" onClick={onSave} type="button">
              Save client
            </button>
          )}
          <button className="secondary-button compact" onClick={onSignOut} type="button">
            Sign out
          </button>
        </div>
      ) : (
        <form className="cloud-login" onSubmit={onSignIn}>
          <input
            placeholder="Email"
            type="email"
            value={authEmail}
            onChange={(event) => onEmailChange(event.target.value)}
            required
          />
          <input
            placeholder="Password"
            type="password"
            value={authPassword}
            onChange={(event) => onPasswordChange(event.target.value)}
            required
          />
          <button className="primary-button compact" type="submit">
            Sign in
          </button>
        </form>
      )}
    </section>
  )
}

function DashboardView({
  clients,
  metrics,
}: {
  clients: Client[]
  metrics: { active: number; ready: number; sent: number; assets: number }
}) {
  const statusCounts = statusOrder.map((status) => ({
    status,
    count: clients.filter((client) => client.status === status).length,
  }))
  const totalClients = Math.max(clients.length, 1)
  const selectedPackages = clients
    .map((client) =>
      client.selection
        ? client.packages.find((pkg) => pkg.id === client.selection?.packageId)
        : undefined,
    )
    .filter((pkg): pkg is PackageOption => Boolean(pkg))
  const selectedValue = selectedPackages.reduce((total, pkg) => total + pkg.price, 0)
  const monthlyValue = selectedPackages
    .filter((pkg) => pkg.cycle !== 'one-off')
    .reduce((total, pkg) => total + pkg.price, 0)

  return (
    <div className="dashboard-grid">
      <section className="panel span-2">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Pipeline</p>
            <h2>Client acquisition board</h2>
          </div>
        </div>
        <div className="metric-grid">
          <Metric icon={<Send size={18} />} label="Proposals out" value={metrics.sent} />
          <Metric icon={<ClipboardList size={18} />} label="Ready to invoice" value={metrics.ready} />
          <Metric icon={<BriefcaseBusiness size={18} />} label="Active clients" value={metrics.active} />
          <Metric icon={<FolderOpen size={18} />} label="Asset links" value={metrics.assets} />
        </div>
        <div className="pipeline-row">
          {statusCounts.map(({ status, count }) => (
            <div className="pipeline-column" key={status}>
              <strong>{status}</strong>
              <span>{count}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel graph-panel">
        <div className="section-heading compact-heading">
          <div>
            <p className="eyebrow">Overview</p>
            <h2>Status mix</h2>
          </div>
          <LineChart size={20} />
        </div>
        <div
          className="donut-chart"
          style={{
            background: `conic-gradient(#126c5b 0 ${metrics.active / totalClients}turn, #f2c14e 0 ${(metrics.active + metrics.ready) / totalClients}turn, #7d9ba6 0 ${(metrics.active + metrics.ready + metrics.sent) / totalClients}turn, #dbe2e6 0 1turn)`,
          }}
        >
          <strong>{clients.length}</strong>
          <span>clients</span>
        </div>
        <div className="legend-row">
          <span><i className="green-dot" />Active</span>
          <span><i className="gold-dot" />Ready</span>
          <span><i className="blue-dot" />In motion</span>
        </div>
      </section>

      <section className="panel graph-panel">
        <div className="section-heading compact-heading">
          <div>
            <p className="eyebrow">Value</p>
            <h2>Selected work</h2>
          </div>
          <TrendingUp size={20} />
        </div>
        <div className="value-stack">
          <strong>{money(selectedValue)}</strong>
          <span>Total selected package value</span>
          <div className="value-bar">
            <i style={{ width: `${Math.min(100, selectedValue / 40)}%` }} />
          </div>
          <small>{money(monthlyValue)} monthly recurring value</small>
        </div>
      </section>

      <section className="panel span-2">
        <p className="eyebrow">Pipeline shape</p>
        <h2>Where clients are sitting</h2>
        <div className="bar-chart">
          {statusCounts.map(({ status, count }) => (
            <div className="bar-row" key={status}>
              <span>{status}</span>
              <div>
                <i style={{ width: `${Math.max(7, (count / totalClients) * 100)}%` }} />
              </div>
              <strong>{count}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="panel span-2">
        <p className="eyebrow">Next actions</p>
        <h2>Today&apos;s handoff list</h2>
        <div className="action-list">
          {clients
            .filter((item) => ['Ready To Invoice', 'Package Selected', 'Proposal Sent'].includes(item.status))
            .slice(0, 5)
            .map((item) => (
              <div className="action-item" key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.selection ? 'Package chosen, invoice details captured' : 'Proposal link waiting on client'}</span>
                </div>
                <span className={`status-chip ${item.status.toLowerCase().replaceAll(' ', '-')}`}>
                  {item.status}
                </span>
              </div>
            ))}
        </div>
      </section>
    </div>
  )
}

function ClientOverview({
  client,
  copied,
  onDelete,
  onCopyPortal,
  onUpdate,
}: {
  client: Client
  copied: string
  onDelete: () => void
  onCopyPortal: () => void
  onUpdate: (id: string, nextClient: Partial<Client>) => void
}) {
  const selectedPackage = client.selection
    ? client.packages.find((pkg) => pkg.id === client.selection?.packageId)
    : undefined

  return (
    <div className="view-grid">
      <section className="panel">
        <p className="eyebrow">Client setup</p>
        <h2>Business details</h2>
        <div className="form-stack">
          <label>
            Business name
            <input
              value={client.name}
              onChange={(event) =>
                {
                  const slug = slugify(event.target.value) || client.slug
                  onUpdate(client.id, {
                    name: event.target.value,
                    slug,
                    portalUsername: slug,
                  })
                }
              }
            />
          </label>
          <label>
            Proposal slug
            <input
              value={client.slug}
              onChange={(event) => {
                const slug = slugify(event.target.value)
                onUpdate(client.id, {
                  slug,
                  portalUsername: slug || client.portalUsername,
                })
              }}
            />
          </label>
          <label>
            Status
            <select
              value={client.status}
              onChange={(event) =>
                onUpdate(client.id, { status: event.target.value as ClientStatus })
              }
            >
              {statusOrder.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="panel">
        <p className="eyebrow">Contact</p>
        <h2>Xero-ready details</h2>
        <div className="detail-list">
          <Detail icon={<UserRound size={16} />} label="Contact" value={client.selection?.contactName || client.contactName || 'Not captured'} />
          <Detail icon={<Mail size={16} />} label="Email" value={client.selection?.email || client.email || 'Not captured'} />
          <Detail icon={<Phone size={16} />} label="Phone" value={client.selection?.phone || client.phone || 'Not captured'} />
          <Detail icon={<FileText size={16} />} label="Selected" value={selectedPackage?.name ?? 'No package selected'} />
        </div>
        <button className="secondary-button full" onClick={onCopyPortal} type="button">
          <Copy size={17} />
          {copied === 'portal' ? 'Portal copied' : 'Copy portal link'}
        </button>
      </section>

      <section className="panel">
        <p className="eyebrow">Portal access</p>
        <h2>Client login details</h2>
        <div className="detail-list">
          <Detail icon={<UserRound size={16} />} label="Username" value={client.portalUsername} />
          <Detail icon={<KeyRound size={16} />} label="Password" value={client.portalPassword} />
        </div>
        <button
          className="secondary-button full"
          onClick={() =>
            navigator.clipboard.writeText(
              `Username: ${client.portalUsername}\nPassword: ${client.portalPassword}`,
            )
          }
          type="button"
        >
          <Copy size={17} />
          Copy login details
        </button>
      </section>

      <section className="panel danger-panel">
        <p className="eyebrow">Manage</p>
        <h2>Client record</h2>
        <p>Remove this client from the local prototype when it is no longer needed.</p>
        <button className="danger-button full" onClick={onDelete} type="button">
          <Trash2 size={17} />
          Delete client
        </button>
      </section>

      <section className="panel span-2">
        <p className="eyebrow">Client snapshot</p>
        <h2>Current workspace state</h2>
        <div className="client-snapshot-grid">
          <div>
            <strong>{client.packages.length}</strong>
            <span>proposal options</span>
          </div>
          <div>
            <strong>{client.assets.length}</strong>
            <span>asset links</span>
          </div>
          <div>
            <strong>{client.campaigns.length}</strong>
            <span>campaign requests</span>
          </div>
          <div>
            <strong>{client.selection ? 'Ready' : 'Waiting'}</strong>
            <span>invoice details</span>
          </div>
        </div>
      </section>
    </div>
  )
}

function ProposalBuilder({
  client,
  copied,
  onCopy,
  onUpdate,
}: {
  client: Client
  copied: string
  onCopy: () => void
  onUpdate: (id: string, nextClient: Partial<Client>) => void
}) {
  const updatePackage = (packageId: string, nextPackage: Partial<PackageOption>) => {
    onUpdate(client.id, {
      packages: client.packages.map((pkg) =>
        pkg.id === packageId ? { ...pkg, ...nextPackage } : pkg,
      ),
    })
  }

  const addPackage = () => {
    onUpdate(client.id, {
      packages: [
        ...client.packages,
        {
          id: crypto.randomUUID(),
          name: 'Custom Package',
          summary: 'A tailored package for this client.',
          price: 750,
          cycle: 'one-off',
          features: ['Audit notes', 'Content plan', 'Asset handoff'],
        },
      ],
    })
  }

  return (
    <div className="view-grid">
      <section className="panel span-2">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Proposal page</p>
            <h2>Client-facing package offer</h2>
          </div>
          <button className="secondary-button" onClick={onCopy} type="button">
            <Copy size={17} />
            {copied === 'proposal' ? 'Copied' : 'Copy link'}
          </button>
        </div>
        <label className="wide-label">
          Personal intro
          <textarea
            rows={4}
            value={client.proposalIntro}
            onChange={(event) => onUpdate(client.id, { proposalIntro: event.target.value })}
          />
        </label>
        <div className="audit-grid">
          {client.auditNotes.map((note, index) => (
            <label key={`${client.id}-note-${index}`}>
              Audit point {index + 1}
              <textarea
                rows={3}
                value={note}
                onChange={(event) => {
                  const auditNotes = [...client.auditNotes]
                  auditNotes[index] = event.target.value
                  onUpdate(client.id, { auditNotes })
                }}
              />
            </label>
          ))}
        </div>
      </section>

      <section className="panel span-2">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Packages</p>
            <h2>Pricing options</h2>
          </div>
          <button className="primary-button compact" onClick={addPackage} type="button">
            <PackagePlus size={16} />
            Add package
          </button>
        </div>
        <div className="package-editor-grid">
          {client.packages.map((pkg) => (
            <article className="package-editor" key={pkg.id}>
              <label>
                Package name
                <input
                  value={pkg.name}
                  onChange={(event) => updatePackage(pkg.id, { name: event.target.value })}
                />
              </label>
              <label>
                Summary
                <textarea
                  rows={3}
                  value={pkg.summary}
                  onChange={(event) => updatePackage(pkg.id, { summary: event.target.value })}
                />
              </label>
              <div className="split-fields">
                <label>
                  Price
                  <input
                    type="number"
                    value={pkg.price}
                    onChange={(event) => updatePackage(pkg.id, { price: Number(event.target.value) })}
                  />
                </label>
                <label>
                  Billing
                  <select
                    value={pkg.cycle}
                    onChange={(event) =>
                      updatePackage(pkg.id, { cycle: event.target.value as BillingCycle })
                    }
                  >
                    <option value="one-off">one-off</option>
                    <option value="monthly">monthly</option>
                    <option value="setup + monthly">setup + monthly</option>
                  </select>
                </label>
              </div>
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={Boolean(pkg.recommended)}
                  onChange={(event) => updatePackage(pkg.id, { recommended: event.target.checked })}
                />
                Mark as recommended
              </label>
              <label>
                Features
                <textarea
                  rows={5}
                  value={pkg.features.join('\n')}
                  onChange={(event) =>
                    updatePackage(pkg.id, {
                      features: event.target.value.split('\n').filter(Boolean),
                    })
                  }
                />
              </label>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function PortalManager({
  client,
  onUpdate,
}: {
  client: Client
  onUpdate: (id: string, nextClient: Partial<Client>) => void
}) {
  const [asset, setAsset] = useState({ title: '', url: '', type: 'Google Drive' })
  const [campaign, setCampaign] = useState({ title: '', dueDate: '', notes: '' })

  const addAsset = (event: FormEvent) => {
    event.preventDefault()
    if (!asset.title || !asset.url) return
    onUpdate(client.id, {
      assets: [
        {
          id: crypto.randomUUID(),
          title: asset.title,
          url: asset.url,
          type: asset.type,
          addedAt: new Date().toISOString().slice(0, 10),
        },
        ...client.assets,
      ],
    })
    setAsset({ title: '', url: '', type: 'Google Drive' })
  }

  const addCampaign = (event: FormEvent) => {
    event.preventDefault()
    if (!campaign.title) return
    onUpdate(client.id, {
      campaigns: [
        {
          id: crypto.randomUUID(),
          title: campaign.title,
          dueDate: campaign.dueDate,
          notes: campaign.notes,
          status: 'New',
        },
        ...client.campaigns,
      ],
    })
    setCampaign({ title: '', dueDate: '', notes: '' })
  }

  return (
    <div className="view-grid">
      <section className="panel">
        <p className="eyebrow">Asset handoff</p>
        <h2>Add client link</h2>
        <form className="form-stack" onSubmit={addAsset}>
          <label>
            Title
            <input value={asset.title} onChange={(event) => setAsset({ ...asset, title: event.target.value })} />
          </label>
          <label>
            Link
            <input value={asset.url} onChange={(event) => setAsset({ ...asset, url: event.target.value })} />
          </label>
          <label>
            Type
            <select value={asset.type} onChange={(event) => setAsset({ ...asset, type: event.target.value })}>
              <option>Google Drive</option>
              <option>Canva</option>
              <option>Document</option>
              <option>Folder</option>
            </select>
          </label>
          <button className="primary-button full" type="submit">
            <LinkIcon size={17} />
            Add asset
          </button>
        </form>
      </section>

      <section className="panel">
        <p className="eyebrow">Client requests</p>
        <h2>Add campaign</h2>
        <form className="form-stack" onSubmit={addCampaign}>
          <label>
            Campaign
            <input value={campaign.title} onChange={(event) => setCampaign({ ...campaign, title: event.target.value })} />
          </label>
          <label>
            Due date
            <input type="date" value={campaign.dueDate} onChange={(event) => setCampaign({ ...campaign, dueDate: event.target.value })} />
          </label>
          <label>
            Notes
            <textarea rows={4} value={campaign.notes} onChange={(event) => setCampaign({ ...campaign, notes: event.target.value })} />
          </label>
          <button className="secondary-button full" type="submit">
            <CalendarPlus size={17} />
            Add request
          </button>
        </form>
      </section>

      <section className="panel span-2">
        <p className="eyebrow">Client portal preview</p>
        <h2>What the client will see</h2>
        <ClientPortal client={client} embedded />
      </section>
    </div>
  )
}

function ProposalPage({
  client,
  onSelectPackage,
}: {
  client: Client
  onBack: () => void
  onSelectPackage: (
    packageId: string,
    selection: Omit<Selection, 'packageId'>,
  ) => void | Promise<void>
}) {
  const [selectedPackage, setSelectedPackage] = useState(client.packages[0]?.id ?? '')
  const [submitted, setSubmitted] = useState(false)
  const selected = client.packages.find((pkg) => pkg.id === selectedPackage)

  const submitSelection = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    await onSelectPackage(selectedPackage, {
      submittedAt: new Date().toISOString().slice(0, 10),
      contactName: String(form.get('contactName') ?? ''),
      email: String(form.get('email') ?? ''),
      phone: String(form.get('phone') ?? ''),
      billingName: String(form.get('billingName') ?? ''),
      abn: String(form.get('abn') ?? ''),
      invoiceNotes: String(form.get('invoiceNotes') ?? ''),
    })
    setSubmitted(true)
  }

  return (
    <main className="proposal-shell">
      <section className="proposal-hero">
        <div>
          <p className="eyebrow">NoA Client Portal</p>
          <h1>{client.name}</h1>
          <p>{client.proposalIntro}</p>
        </div>
        <div className="proposal-summary">
          <Sparkles size={22} />
          <strong>Social media growth proposal</strong>
          <span>Choose the package that fits where your business is right now.</span>
        </div>
      </section>

      <section className="audit-band">
        {client.auditNotes.map((note, index) => (
          <div key={`${client.id}-audit-${index}`}>
            <Check size={18} />
            <span>{note}</span>
          </div>
        ))}
      </section>

      <section className="pricing-grid">
        {client.packages.map((pkg) => (
          <article className={pkg.recommended ? 'price-card recommended' : 'price-card'} key={pkg.id}>
            {pkg.recommended && <span className="recommend-badge">Recommended</span>}
            <h2>{pkg.name}</h2>
            <p>{pkg.summary}</p>
            <strong className="price">{cycleLabel(pkg)}</strong>
            <ul>
              {pkg.features.map((feature) => (
                <li key={feature}>
                  <Check size={16} />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              className={selectedPackage === pkg.id ? 'primary-button full' : 'secondary-button full'}
              onClick={() => setSelectedPackage(pkg.id)}
              type="button"
            >
              {selectedPackage === pkg.id ? 'Selected' : 'Choose package'}
            </button>
          </article>
        ))}
      </section>

      <section className="selection-panel">
        <div>
          <p className="eyebrow">Next step</p>
          <h2>{submitted ? 'Selection received' : 'Confirm your details'}</h2>
          <p>
            {submitted
              ? 'Thanks, your package selection and invoice details have been captured.'
              : `Selected package: ${selected?.name ?? 'Choose a package above'}`}
          </p>
        </div>
        {!submitted ? (
          <form className="selection-form" onSubmit={submitSelection}>
            <input name="contactName" placeholder="Your name" required />
            <input name="email" placeholder="Email" required type="email" />
            <input name="phone" placeholder="Phone" required />
            <input name="billingName" placeholder="Billing name or business name" required />
            <input name="abn" placeholder="ABN, optional" />
            <textarea name="invoiceNotes" placeholder="Anything I should know for the invoice?" rows={4} />
            <button className="primary-button" type="submit">
              Submit selection
              <ArrowRight size={17} />
            </button>
          </form>
        ) : (
          <div className="success-box">
            <Check size={22} />
            <span>Your details are ready for invoice setup.</span>
          </div>
        )}
      </section>
    </main>
  )
}

function ClientPortal({ client, embedded = false }: { client: Client; embedded?: boolean }) {
  const selectedPackage = client.selection
    ? client.packages.find((pkg) => pkg.id === client.selection?.packageId)
    : undefined

  return (
    <main className={embedded ? 'portal-preview' : 'portal-shell'}>
      <section className="portal-header">
        <div>
          <p className="eyebrow">Client workspace</p>
          <h1>{client.name}</h1>
          <p>Assets, requests, package details, and campaign handoff links.</p>
        </div>
        <span className={`status-chip ${client.status.toLowerCase().replaceAll(' ', '-')}`}>
          {client.status}
        </span>
      </section>

      <section className="portal-grid">
        <div className="panel flat">
          <p className="eyebrow">Selected package</p>
          <h2>{selectedPackage?.name ?? 'Package not selected yet'}</h2>
          <p>{selectedPackage?.summary ?? 'Once a package is selected, it will appear here.'}</p>
        </div>

        <div className="panel flat">
          <p className="eyebrow">Assets</p>
          <h2>{client.assets.length} shared links</h2>
          <div className="link-list">
            {client.assets.length ? (
              client.assets.map((asset) => (
                <a href={asset.url} key={asset.id} target="_blank">
                  <FolderOpen size={17} />
                  <span>{asset.title}</span>
                  <small>{asset.type}</small>
                </a>
              ))
            ) : (
              <p>No assets shared yet.</p>
            )}
          </div>
        </div>

        <div className="panel flat span-2">
          <p className="eyebrow">Campaign requests</p>
          <h2>Upcoming work</h2>
          <div className="campaign-list">
            {client.campaigns.length ? (
              client.campaigns.map((campaign) => (
                <div className="campaign-item" key={campaign.id}>
                  <div>
                    <strong>{campaign.title}</strong>
                    <span>{campaign.notes}</span>
                  </div>
                  <small>{campaign.dueDate || 'No date'}</small>
                </div>
              ))
            ) : (
              <p>No campaign requests yet.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: number
}) {
  return (
    <div className="metric">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="detail-row">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

export default App
