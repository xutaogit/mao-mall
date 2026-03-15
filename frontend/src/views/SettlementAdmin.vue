<template>
  <div class="settlement-admin">
    <div class="header">
      <h1>佣金结算管理</h1>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">待结算订单</div>
        <div class="stat-value">{{ statistics.pendingCount }}</div>
        <div class="stat-amount">¥{{ statistics.pendingAmount.toFixed(2) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">已结算订单</div>
        <div class="stat-value">{{ statistics.settledCount }}</div>
        <div class="stat-amount">¥{{ statistics.settledAmount.toFixed(2) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">结算失败</div>
        <div class="stat-value">{{ statistics.failedCount }}</div>
        <div class="stat-amount">¥{{ statistics.failedAmount.toFixed(2) }}</div>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="search-group">
        <input
          v-model="searchDistributorId"
          type="text"
          placeholder="搜索分销员ID"
          @keyup.enter="fetchPendingOrders"
        />
        <button @click="fetchPendingOrders" class="search-btn">搜索</button>
      </div>
      <button
        v-if="selectedOrders.length > 0"
        @click="settleSelected"
        class="settle-btn"
      >
        结算选中的 {{ selectedOrders.length }} 条订单
      </button>
    </div>

    <!-- 待结算订单列表 -->
    <div class="orders-section">
      <h2>待结算订单</h2>
      <div v-if="pendingOrders.length === 0" class="empty-state">
        <p>暂无待结算订单</p>
      </div>
      <div v-else class="orders-table">
        <div class="table-header">
          <div class="col-checkbox">
            <input
              type="checkbox"
              :checked="selectedOrders.length === pendingOrders.length"
              @change="toggleSelectAll"
            />
          </div>
          <div class="col-order">订单号</div>
          <div class="col-distributor">分销员</div>
          <div class="col-customer">客户</div>
          <div class="col-product">商品</div>
          <div class="col-amount">订单金额</div>
          <div class="col-commission">佣金</div>
          <div class="col-time">创建时间</div>
        </div>
        <div v-for="order in pendingOrders" :key="order._id" class="table-row">
          <div class="col-checkbox">
            <input
              type="checkbox"
              :checked="selectedOrders.includes(order._id)"
              @change="toggleSelect(order._id)"
            />
          </div>
          <div class="col-order">{{ order.orderSn }}</div>
          <div class="col-distributor">
            {{ order.distributorId?.distributorCode || 'N/A' }}
          </div>
          <div class="col-customer">{{ order.customerId?.nickname || 'N/A' }}</div>
          <div class="col-product">{{ order.productId?.name || '商品已删除' }}</div>
          <div class="col-amount">¥{{ order.orderAmount.toFixed(2) }}</div>
          <div class="col-commission">¥{{ order.commissionAmount.toFixed(2) }}</div>
          <div class="col-time">{{ formatDate(order.createdAt) }}</div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="totalPage > 1" class="pagination">
        <button
          v-for="page in totalPage"
          :key="page"
          :class="['page-btn', { active: currentPage === page }]"
          @click="currentPage = page; fetchPendingOrders()"
        >
          {{ page }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const statistics = ref({
  pendingCount: 0,
  pendingAmount: 0,
  settledCount: 0,
  settledAmount: 0,
  failedCount: 0,
  failedAmount: 0
});

const pendingOrders = ref([]);
const selectedOrders = ref([]);
const currentPage = ref(1);
const totalPage = ref(1);
const searchDistributorId = ref('');
const loading = ref(false);

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const fetchStatistics = async () => {
  try {
    const response = await fetch('/api/admin/settlement/statistics', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const data = await response.json();
    if (data.success) {
      statistics.value = data.data;
    }
  } catch (error) {
    console.error('获取统计信息失败:', error);
  }
};

const fetchPendingOrders = async () => {
  try {
    const query = new URLSearchParams({
      page: currentPage.value,
      pageSize: 10
    });

    if (searchDistributorId.value) {
      query.append('distributorId', searchDistributorId.value);
    }

    const response = await fetch(`/api/admin/settlement/pending?${query}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const data = await response.json();
    if (data.success) {
      pendingOrders.value = data.data.list;
      totalPage.value = data.data.totalPage;
      selectedOrders.value = [];
    }
  } catch (error) {
    console.error('获取待结算订单失败:', error);
  }
};

const toggleSelect = (orderId) => {
  const index = selectedOrders.value.indexOf(orderId);
  if (index > -1) {
    selectedOrders.value.splice(index, 1);
  } else {
    selectedOrders.value.push(orderId);
  }
};

const toggleSelectAll = () => {
  if (selectedOrders.value.length === pendingOrders.value.length) {
    selectedOrders.value = [];
  } else {
    selectedOrders.value = pendingOrders.value.map(order => order._id);
  }
};

const settleSelected = async () => {
  if (selectedOrders.value.length === 0) {
    alert('请选择要结算的订单');
    return;
  }

  loading.value = true;
  try {
    const response = await fetch('/api/admin/settlement/settle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        orderIds: selectedOrders.value
      })
    });

    const data = await response.json();
    if (data.success) {
      alert(data.message);
      selectedOrders.value = [];
      await fetchStatistics();
      await fetchPendingOrders();
    } else {
      alert(data.message);
    }
  } catch (error) {
    alert('结算失败，请重试');
    console.error('结算失败:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchStatistics();
  fetchPendingOrders();
});
</script>

<style scoped>
.settlement-admin {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  margin-bottom: 30px;
}

.header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #333;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.stat-amount {
  font-size: 16px;
  color: #ff6b6b;
  font-weight: 500;
}

.action-bar {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.search-group {
  display: flex;
  gap: 10px;
  flex: 1;
}

.search-group input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.search-btn {
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.search-btn:hover {
  background: #5568d3;
}

.settle-btn {
  padding: 10px 20px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  white-space: nowrap;
}

.settle-btn:hover {
  background: #45a049;
}

.orders-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.orders-section h2 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.orders-table {
  overflow-x: auto;
}

.table-header {
  display: grid;
  grid-template-columns: 50px 120px 120px 120px 150px 100px 120px 150px;
  gap: 10px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 4px;
  font-weight: 600;
  font-size: 14px;
  color: #333;
  margin-bottom: 10px;
}

.table-row {
  display: grid;
  grid-template-columns: 50px 120px 120px 120px 150px 100px 120px 150px;
  gap: 10px;
  padding: 15px;
  border-bottom: 1px solid #eee;
  font-size: 14px;
  align-items: center;
}

.table-row:hover {
  background: #f9f9f9;
}

.col-checkbox {
  text-align: center;
}

.col-checkbox input {
  cursor: pointer;
}

.col-order,
.col-distributor,
.col-customer,
.col-product,
.col-amount,
.col-commission,
.col-time {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.col-amount,
.col-commission {
  text-align: right;
  color: #ff6b6b;
  font-weight: 500;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.page-btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.page-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}
</style>

