<script setup>
import brandLogo1 from "/images/brand/other-brand-logo/1.svg";
import brandLogo2 from "/images/brand/other-brand-logo/2.svg";
import brandLogo3 from "/images/brand/other-brand-logo/3.svg";
import brandLogo4 from "/images/brand/other-brand-logo/4.svg";
import brandLogo5 from "/images/brand/other-brand-logo/5.svg";
import avatar1 from "/images/avatar/avatar-1.jpg";
import avatar2 from "/images/avatar/avatar-2.jpg";
import avatar3 from "/images/avatar/avatar-3.jpg";
import avatar4 from "/images/avatar/avatar-4.jpg";
import avatar5 from "/images/avatar/avatar-5.jpg";
import avatar6 from "/images/avatar/avatar-6.jpg";
import avatar7 from "/images/avatar/avatar-7.jpg";
import avatar8 from "/images/avatar/avatar-8.jpg";
import avatar9 from "/images/avatar/avatar-9.jpg";
import avatar10 from "/images/avatar/avatar-10.jpg";
import avatar11 from "/images/avatar/avatar-11.jpg";
import avatar12 from "/images/avatar/avatar-12.jpg";
import avatar13 from "/images/avatar/avatar-13.jpg";
import avatar14 from "/images/avatar/avatar-14.jpg";
import avatar15 from "/images/avatar/avatar-15.jpg";
import carousel1 from "/images/components/carousel/1.jpg";

const { user } = useAuth();
const api = useApi();

const teamMembers = ref([]);
const projectContributorData = ref([]);
const activityFeed = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const [usersData, motorsData, invoicesData] = await Promise.all([
      api.get("/users"),
      api.get("/assembly/motors"),
      api.get("/sales/invoices"),
    ]);

    teamMembers.value = usersData.filter(u => u.user_id !== user.value?.user_id).slice(0, 4);

    const inProgress = motorsData.filter(m => m.status === "IN_PROGRESS");
    const ready = motorsData.filter(m => m.status === "READY_FOR_SALE");

    projectContributorData.value = [
      ...inProgress.map(m => ({
        id: m.motor_id,
        brand_logo: brandLogo3,
        project: `${m.model_name} #${m.serial_number}`,
        desc: "Assembly in progress",
        avatar: [avatar7, avatar8, avatar9],
      })),
      ...ready.slice(0, 2).map(m => ({
        id: m.motor_id,
        brand_logo: brandLogo4,
        project: `${m.model_name} #${m.serial_number}`,
        desc: "Ready for sale",
        avatar: [avatar10, avatar11, avatar12],
      })),
    ];

    const recentInvoices = invoicesData.slice(0, 3);
    const recentMotors = motorsData
      .filter(m => m.assembled_at || m.received_at)
      .sort((a, b) => new Date(b.assembled_at || b.received_at) - new Date(a.assembled_at || a.received_at))
      .slice(0, 3);

    activityFeed.value = [
      ...recentInvoices.map(inv => ({
        id: inv.invoice_id,
        name: inv.customer_name,
        desc: `Purchased ${inv.invoice_no}`,
        image: avatar11,
        lastSeen: new Date(inv.sold_at).toLocaleString(),
      })),
      ...recentMotors.map(m => ({
        id: m.motor_id,
        name: `Motor #${m.serial_number}`,
        desc: m.status === "IN_PROGRESS" ? "Assembly in progress" : "Assembly completed",
        image: m.status === "IN_PROGRESS" ? avatar12 : avatar13,
        lastSeen: new Date(m.assembled_at || m.received_at).toLocaleString(),
      })),
    ].sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen)).slice(0, 6);
  } catch (e) {
    console.error("Failed to load profile data:", e);
  } finally {
    loading.value = false;
  }
});

const myTeamData = computed(() => {
  if (teamMembers.value.length > 0) {
    return teamMembers.value.map((u, i) => ({
      id: u.user_id,
      name: u.full_name || u.username,
      profile: u.role,
      image: [avatar1, avatar2, avatar3, avatar4, avatar5][i % 5],
    }));
  }
  return [];
});

const menuList = [
  { title: "Action" },
  { title: "Another Action" },
  { title: "Something elese here" },
];
</script>
<template>
  <v-row>
    <v-col cols="12" lg="6">
      <v-card>
        <v-card-title>
          <h4 class="text-h4">About Me</h4>
        </v-card-title>
        <v-divider />
        <v-card-item>
          <h5 class="text-h5">Bio</h5>
          <p class="text-body-1 mt-2 mb-6">
            {{ user?.full_name || user?.username || 'User' }} — {{ user?.role || '' }}
          </p>

          <v-row>
            <v-col cols="12">
              <h5 class="text-h5 text-uppercase">Position</h5>
              <p class="text-body-1">{{ user?.role || '' }}</p>
            </v-col>
            <v-col cols="12" sm="6">
              <h5 class="text-h5 text-uppercase">Username</h5>
              <p class="text-body-1">{{ user?.username || '' }}</p>
            </v-col>
            <v-col cols="12" sm="6">
              <h5 class="text-h5 text-uppercase">Role</h5>
              <p class="text-body-1">{{ user?.role || '' }}</p>
            </v-col>
          </v-row>
        </v-card-item>
      </v-card>
    </v-col>

    <v-col cols="12" lg="6">
      <v-card class="mb-5">
        <v-card-title>
          <h4 class="text-h4">Projects Contributions</h4>
        </v-card-title>
        <v-divider />
        <v-card-item>
          <div v-if="loading" class="text-center pa-4">
            <v-progress-circular indeterminate />
          </div>
          <div
            v-for="(item, idx) in projectContributorData"
            :key="item.id"
            :class="`d-flex align-center justify-space-between ga-2 flex-wrap ${
              idx !== projectContributorData.length - 1 ? 'mb-4' : ''
            }`"
          >
            <div class="d-flex ga-2 align-center">
              <v-avatar :image="item.brand_logo" />
              <div>
                <NuxtLink to="/" class="text-h5"> {{ item.project }}</NuxtLink>
                <p class="text-body-1 text-grey-500">{{ item.desc }}</p>
              </div>
            </div>
            <div class="d-flex align-center ga-2">
              <div class="v-avatar-group">
                <v-avatar v-for="image in item.avatar" size="32" :key="image" :image="image" />
              </div>
              <v-menu location="start">
                <template v-slot:activator="{ props }">
                  <icon-btn icon="tabler-dots-vertical" v-bind="props" size="small" />
                </template>
                <v-list>
                  <v-list-item v-for="(item, i) in menuList" :key="i" :value="item.title">
                    <v-list-item-title>{{ item.title }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </div>
        </v-card-item>
      </v-card>
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="12" lg="6">
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between">
          <div class="d-flex ga-2 align-center">
            <v-avatar :image="avatar10" />
            <div>
              <h5 class="text-h5">{{ user?.full_name || user?.username || 'User' }}</h5>
              <p class="text-body-1">19 minutes ago</p>
            </div>
          </div>

          <v-menu location="start">
            <template v-slot:activator="{ props }">
              <icon-btn icon="tabler-dots-vertical" v-bind="props" size="small" />
            </template>
            <v-list>
              <v-list-item v-for="(item, i) in menuList" :key="i" :value="item.title">
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-card-title>

        <v-card-item class="pt-0">
          <p class="text-body-1 mb-4">
            Latest assembly and sales activity from the system.
          </p>
          <v-img :src="carousel1" class="rounded" />
          <div class="d-flex align-center ga-2 my-4 flex-wrap">
            <span class="text-body-1 d-flex align-center ga-1">
              <v-icon icon="tabler-heart" />
              20 Like
            </span>
            <span class="text-body-1 d-flex align-center ga-1">
              <v-icon icon="tabler-message" />
              12 Comment
            </span>
            <span class="text-body-1 d-flex align-center ga-1">
              <v-icon icon="tabler-share" />
              Share
            </span>
          </div>
          <div class="mb-4">
            <v-divider />
            <div class="d-flex align-center ga-2">
              <div class="v-avatar-group py-4">
                <v-avatar size="32" :image="avatar11" />
                <v-avatar size="32" :image="avatar12" />
                <v-avatar size="32" :image="avatar13" />
              </div>
              <p class="text-body-1">You and 20 more liked this</p>
            </div>

            <v-divider />
          </div>
          <div class="d-flex align-center ga-2 flex-wrap">
            <v-avatar :image="avatar11" />
            <GlobalsTextField class="flex-grow-1" />
            <v-btn> Post </v-btn>
          </div>
        </v-card-item>
      </v-card>
    </v-col>

    <v-col cols="12" lg="6">
      <v-card class="mb-5">
        <v-card-title>
          <h4 class="text-h4">My Team</h4>
        </v-card-title>
        <v-divider />
        <v-card-item>
          <div v-if="myTeamData.length === 0" class="text-center pa-4">
            <p class="text-body-1 text-medium-emphasis">No team members</p>
          </div>
          <div
            v-for="(item, idx) in myTeamData"
            :key="item.id"
            :class="`d-flex align-center justify-space-between ga-2 flex-wrap ${
              idx !== myTeamData.length - 1 ? 'mb-4' : ''
            }`"
          >
            <div class="d-flex ga-2 align-center">
              <v-avatar :image="item.image" />
              <div>
                <NuxtLink to="/" class="text-h5"> {{ item.name }}</NuxtLink>
                <p class="text-body-1 text-grey-500">{{ item.profile }}</p>
              </div>
            </div>

            <div>
              <icon-btn>
                <v-icon icon="tabler-phone-call" />
                <v-tooltip activator="parent" location="top"> Call </v-tooltip>
              </icon-btn>
              <icon-btn>
                <v-icon icon="tabler-video" />
                <v-tooltip activator="parent" location="top"> Video </v-tooltip>
              </icon-btn>
            </div>
          </div>
        </v-card-item>
      </v-card>

      <v-card>
        <v-card-title>
          <h4 class="text-h4">Activity Feed</h4>
        </v-card-title>
        <v-divider />
        <v-card-item>
          <div v-if="loading" class="text-center pa-4">
            <v-progress-circular indeterminate />
          </div>
          <div v-else-if="activityFeed.length === 0" class="text-center pa-4">
            <p class="text-body-1 text-medium-emphasis">No recent activity</p>
          </div>
          <div
            v-for="(item, idx) in activityFeed"
            :key="item.id"
            :class="`${idx !== activityFeed.length - 1 ? 'mb-4' : ''}`"
          >
            <div class="d-flex ga-2">
              <v-avatar :image="item.image" />
              <div>
                <NuxtLink to="/" class="text-h5"> {{ item.name }}</NuxtLink>
                <p class="text-body-1 text-grey-500 mb-1">{{ item.desc }}</p>
                <p class="text-body-2">{{ item.lastSeen }}</p>
              </div>
            </div>
          </div>
        </v-card-item>
      </v-card>
    </v-col>
  </v-row>
</template>
