<script setup>
const api = useApi();
const route = useRoute();
const auth = useAuth();
const invoice = ref(null);
const loading = ref(true);
const actionLoading = ref(false);
const fullscreenProofUrl = ref(null);
const showFullscreenProof = ref(false);

const loadInvoice = async () => {
  loading.value = true;
  try {
    const data = await api.get(`/sales/invoices/${route.params.id}`);
    invoice.value = data;
  } catch (e) {
    console.error("Failed to load invoice:", e);
  } finally {
    loading.value = false;
  }
};

const approveInvoice = async (approve) => {
  actionLoading.value = true;
  try {
    await api.post(`/sales/invoices/${invoice.value.invoice_id}/approve`, { approve });
    invoice.value.status = approve ? "APPROVED" : "REJECTED";
  } catch (e) {
    console.error("Failed to process invoice:", e);
  } finally {
    actionLoading.value = false;
  }
};

const downloadPdf = async () => {
  const fullApiUrl = `/api/v1/sales/invoices/${invoice.value.invoice_id}/pdf`;
  try {
    const response = await fetch(fullApiUrl, {
      headers: { Authorization: `Bearer ${auth.token?.value || ''}` }
    });
    if (!response.ok) {
      console.error('PDF download failed:', response.status);
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoice.value.invoice_no}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('PDF download error:', e);
  }
};

const openFullscreenProof = (imageUrl) => {
  fullscreenProofUrl.value = imageUrl;
  showFullscreenProof.value = true;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return path.startsWith("/") ? path : `/${path}`;
};

onMounted(() => {
  auth.initAuth();
  loadInvoice();
});
</script>

<template>
  <v-container fluid>
    <GlobalsHeader title="Invoice Details" is-btn btn-color="light" btn-text="Back to Invoices" to="/showroom/invoices" />

    <div v-if="loading" class="text-center pa-8">
      <v-progress-circular indeterminate size="48" />
    </div>

    <div v-else-if="invoice">
      <v-row>
        <v-col cols="12" md="8">
          <v-card>
            <v-card-item class="pa-6">
              <h4 class="text-h4 mb-4">{{ invoice.invoice_no }}</h4>
              
              <h5 class="text-h5 mb-2">Customer Information</h5>
              <v-row>
                <v-col cols="12" sm="6">
                  <div class="text-body-2 text-medium-emphasis">Full Name</div>
                  <div class="text-body-1 font-weight-medium">{{ invoice.customer_name }}</div>
                </v-col>
                <v-col cols="12" sm="6" v-if="invoice.customer_id_number">
                  <div class="text-body-2 text-medium-emphasis">ID Number</div>
                  <div class="text-body-1 font-weight-medium">{{ invoice.customer_id_number }}</div>
                </v-col>
                <v-col cols="12" sm="6" v-if="invoice.customer_id_type">
                  <div class="text-body-2 text-medium-emphasis">ID Type</div>
                  <div class="text-body-1 font-weight-medium">{{ invoice.customer_id_type }}</div>
                </v-col>
                <v-col cols="12" sm="6" v-if="invoice.customer_id_issue_date">
                  <div class="text-body-2 text-medium-emphasis">ID Issue Date</div>
                  <div class="text-body-1 font-weight-medium">{{ invoice.customer_id_issue_date }}</div>
                </v-col>
                <v-col cols="12" sm="6" v-if="invoice.customer_id_expiry_date">
                  <div class="text-body-2 text-medium-emphasis">ID Expiry Date</div>
                  <div class="text-body-1 font-weight-medium">{{ invoice.customer_id_expiry_date }}</div>
                </v-col>
                <v-col cols="12" sm="6" v-if="invoice.customer_id_authority">
                  <div class="text-body-2 text-medium-emphasis">Issuing Authority</div>
                  <div class="text-body-1 font-weight-medium">{{ invoice.customer_id_authority }}</div>
                </v-col>
              </v-row>

              <h5 class="text-h5 mb-2 mt-4">Contact Details</h5>
              <v-row>
                <v-col cols="12" sm="6">
                  <div class="text-body-2 text-medium-emphasis">Primary Phone</div>
                  <div class="text-body-1 font-weight-medium">{{ invoice.customer_phone }}</div>
                </v-col>
                <v-col cols="12" sm="6" v-if="invoice.customer_alt_phone">
                  <div class="text-body-2 text-medium-emphasis">Alternative Phone</div>
                  <div class="text-body-1 font-weight-medium">{{ invoice.customer_alt_phone }}</div>
                </v-col>
                <v-col cols="12" sm="6" v-if="invoice.customer_email">
                  <div class="text-body-2 text-medium-emphasis">Email</div>
                  <div class="text-body-1 font-weight-medium">{{ invoice.customer_email }}</div>
                </v-col>
              </v-row>

              <h5 class="text-h5 mb-2 mt-4">Physical Address</h5>
              <v-row>
                <v-col cols="12" sm="3" v-if="invoice.customer_region">
                  <div class="text-body-2 text-medium-emphasis">Region</div>
                  <div>{{ invoice.customer_region }}</div>
                </v-col>
                <v-col cols="12" sm="3" v-if="invoice.customer_city">
                  <div class="text-body-2 text-medium-emphasis">City</div>
                  <div>{{ invoice.customer_city }}</div>
                </v-col>
                <v-col cols="12" sm="3" v-if="invoice.customer_sub_city">
                  <div class="text-body-2 text-medium-emphasis">Sub-City</div>
                  <div>{{ invoice.customer_sub_city }}</div>
                </v-col>
                <v-col cols="12" sm="3" v-if="invoice.customer_woreda">
                  <div class="text-body-2 text-medium-emphasis">Woreda</div>
                  <div>{{ invoice.customer_woreda }}</div>
                </v-col>
              </v-row>
              <v-col cols="12" v-if="invoice.customer_house_number" class="mt-2">
                <div class="text-body-2 text-medium-emphasis">House Number</div>
                <div>{{ invoice.customer_house_number }}</div>
              </v-col>

              <v-divider class="my-4" />

              <h5 class="text-h5 mb-2">Motors Sold ({{ invoice.motor_count || 0 }})</h5>

              <v-table v-if="invoice.motor_links && invoice.motor_links.length" class="mb-4">
                <thead>
                  <tr>
                    <th>Serial Number</th>
                    <th>Model</th>
                    <th>Color</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="motor in invoice.motor_links" :key="motor.motor_id">
                    <td>{{ motor.serial_number }}</td>
                    <td>{{ motor.model_name }}</td>
                    <td>{{ motor.color }}</td>
                  </tr>
                </tbody>
              </v-table>
              <div v-else-if="invoice.motor_count" class="text-body-2 text-medium-emphasis mb-4">
                Loading motor details...
              </div>

              <v-divider class="my-4" />

              <h5 class="text-h5 mb-2">Payment Summary</h5>
              <v-row>
                <v-col cols="12" sm="4">
                  <div class="text-body-2 text-medium-emphasis">Method</div>
                  <div class="text-body-1 font-weight-medium">{{ invoice.payment_method }}</div>
                </v-col>
                <v-col cols="12" sm="4">
                  <div class="text-body-2 text-medium-emphasis">Date</div>
                  <div class="text-body-1 font-weight-medium">{{ formatDate(invoice.sold_at) }}</div>
                </v-col>
                <v-col cols="12" sm="4" v-if="invoice.payment_proof_path">
                  <div class="text-body-2 text-medium-emphasis">Payment Proof</div>
                  <img 
                    :src="formatImageUrl(invoice.payment_proof_path)" 
                    style="max-height: 80px; object-fit: contain; cursor: pointer; border: 1px solid #e0e0e0; border-radius: 4px;"
                    @click="openFullscreenProof(formatImageUrl(invoice.payment_proof_path))"
                    @error="console.error('Image load failed:', invoice.payment_proof_path)"
                  />
                </v-col>
              </v-row>

              <v-divider class="my-4" />

              <v-row>
                <v-col cols="12" sm="4">
                  <div class="text-body-2 text-medium-emphasis">Subtotal</div>
                  <div class="text-body-1 font-weight-medium">{{ invoice.subtotal }}</div>
                </v-col>
                <v-col cols="12" sm="4">
                  <div class="text-body-2 text-medium-emphasis">Tax</div>
                  <div class="text-body-1 font-weight-medium">{{ invoice.tax }}</div>
                </v-col>
                <v-col cols="12" sm="4">
                  <div class="text-body-2 text-medium-emphasis">Total</div>
                  <div class="text-h6 font-weight-bold">{{ invoice.total }}</div>
                </v-col>
              </v-row>
            </v-card-item>
          </v-card>
        </v-col>

<v-col cols="12" md="4">
          <v-card v-if="invoice.status === 'PENDING_APPROVAL' && auth.isAdmin()">
            <v-card-item class="pa-6">
              <h4 class="text-h4 mb-4">Admin Actions</h4>
              <div class="d-flex flex-column ga-2">
                <v-btn color="success" variant="elevated" @click="approveInvoice(true)" :loading="actionLoading">
                  Approve Sale
                </v-btn>
                <v-btn color="error" variant="tonal" @click="approveInvoice(false)" :loading="actionLoading">
                  Reject
                </v-btn>
                <v-divider class="my-2" />
                <v-btn color="secondary" variant="outlined" @click="downloadPdf">
                  Download PDF
                </v-btn>
              </div>
            </v-card-item>
          </v-card>

          <v-card v-else-if="invoice.status !== 'PENDING_APPROVAL'" class="mt-4">
            <v-card-item class="pa-6">
              <h4 class="text-h4 mb-4">Status</h4>
              <v-chip :color="invoice.status === 'APPROVED' ? 'success' : 'error'" size="large">
                {{ invoice.status }}
              </v-chip>
              <v-btn class="mt-2" color="primary" block @click="window.print()">
                Print Invoice
              </v-btn>
              <v-btn class="mt-2" color="secondary" block @click="downloadPdf">
                Download PDF
              </v-btn>
            </v-card-item>
          </v-card>
          <v-card v-else-if="!auth.isAdmin()" class="mt-4">
            <v-card-item class="pa-6">
              <h4 class="text-h4 mb-4">Status</h4>
              <v-chip color="warning" size="large">
                {{ invoice.status }}
              </v-chip>
              <v-btn class="mt-2" color="secondary" block @click="downloadPdf">
                Download PDF
              </v-btn>
            </v-card-item>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <v-dialog v-model="showFullscreenProof" max-width="900">
      <v-card v-if="fullscreenProofUrl">
        <v-card-actions class="justify-end">
          <v-btn icon="tabler-x" variant="text" @click="showFullscreenProof = false" />
        </v-card-actions>
        <v-card-text class="d-flex justify-center pa-4">
          <img :src="fullscreenProofUrl" style="max-height: 80vh; max-width: 100%; object-fit: contain;" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>