<template>
  <div class="distribution-center">
    <div class="header">
      <h1>分销中心</h1>
      <p class="subtitle">推广商品赚取佣金</p>
    </div>

    <!-- 分销员状态 -->
    <div v-if="!distributorInfo" class="apply-section">
      <div class="apply-card">
        <h2>成为分销员</h2>
        <p>加入我们的分销计划，推广商品赚取佣金</p>
        <router-link to="/distributor/apply" class="apply-btn">
          立即申请
        </router-link>
      </div>
    </div>

    <div v-else>
      <!-- 分销员信息 -->
      <div class="distributor-info">
        <div class="info-card">
          <h3>分销员状态</h3>
          <p :class="['status', `status-${distributorInfo.status}`]">
            {{ getStatusText(distributorInfo.status) }}
          </p>
          <p v-if="distributorInfo.status === 1" class="distributor-code">
            分销员代码：<strong>{{ distributorInfo.distributorCode }}</strong>
          </p>
        </div>
      </div>

      <!-- 统计数据 -->
      <div v-if="distributorInfo.status === 1" class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <div class="stat-label">累计佣金</div>
            <div class="stat-value">¥{{ centerData.totalCommission.toFixed(2) }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📈</div>
          <div class="stat-content">
            <div class="stat-label">今日预估</div>
            <div class="stat-value">¥{{ centerData.todayCommission.toFixed(2) }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📦</div>
          <div class="stat-content">
            <div class="stat-label">推广订单</div>
            <div class="stat-value">{{ centerData.totalOrders }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <div class="stat-label">推广人数</div>
            <div class="stat-value">{{ centerData.totalCustomers }}</div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div v-if="distributorInfo.status === 1" class="action-buttons">
        <router-link to="/withdrawal" class="btn btn-primary">
          申请提现
        </router-link>
        <button @click="copyDistributorCode" class="btn btn-secondary">
          复制推广链接
        </button>
      </div>

      <!-- 佣金明细 -->
      <div v-if="distributorInfo.status === 1" class="orders-section">
        <h2>佣金明细</h2>
        <div class="filter-bar">
          <select v-model="filterStatus" @change="fetchOrders">
            <option value="">全部状态</option>
            <option value="0">待结算</option>
            <option value="1">已结算</option>
            <option value="2">结算失败</option>
            <option value="3">已取消</option>
          </select>
        </div>

        <div v-if="orders.length === 0" class="empty-state">
          <p>暂无佣金记录</p>
        </div>

        <div v-else class="orders-list">
          <div v-for="order in orders" :key="order._id" class="order-item">
            <div class="order-header">
              <div class="product-info">
                <img v-if="order.productId?.pic" :src="order.productId.pic" :alt="order.productId?.name" class="product-pic" />
                <div class="product-details">
                  <p class="product-name">{{ order.productId?.name || '商品已删除' }}</p>
                  <p class="order-sn">订单号：{{ order.orderSn }}</p>
                </div>
              </div>
              <div class="order-amount">
                <p class="commission">¥{{ order.commissionAmount.toFixed(2) }}</p>
                <p :class="['status', `status-${order.settlementStatus}`]">
                  {{ getSettlementStatus(order.settlementStatus) }}
                </p>
              </div>
            </div>
            <div class="order-footer">
              <span class="time">{{ formatDate(order.createdAt) }}</span>
              <span class="order-total">订单金额：¥{{ order.orderAmount.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="totalPage > 1" class="pagination">
          <button
            v-for="page in totalPage"
            :key="page"
            :class="['page-btn', { active: currentPage === page }]"
            @click="currentPage = page; fetchOrders()"
          >
            {{ page }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const distributorInfo = ref(null);
const centerData = ref({
  totalCommission: 0,
  todayCommission: 0,
  totalOrders: 0,
  totalCustomers: 0,
  distributorCode: ''
});

const orders = ref([]);
const currentPage = ref(1);
const totalPage = ref(1);
const filterStatus = ref('');

const getStatusText = (status) => {
  const statusMap = {
    0: '待审核',
    1: '已通过',
    2: '已拒绝'
  };
  return statusMap[status] || '未知';
};

const getSettlementStatus = (status) => {
  const statusMap = {
    0: '待结算',
    1: '已结算',
    2: '结算失败',
    3: '已取消'
  };
  return statusMap[status] || '未知';
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const fetchDistributorInfo = async () => {
  try {
    const response = await fetch('/api/distributor/info', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const data = await response.json();
    if (data.success) {
      distributorInfo.value = data.data;
      if (data.data?.status === 1) {
        await fetchCenterData();
        await fetchOrders();
      }
    }
  } catch (error) {
    console.error('获取分销员信息失败:', error);
  }
};

const fetchCenterData = async () => {
  try {
    const response = await fetch('/api/distributor/center', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const data = await response.json();
    if (data.success) {
      centerData.value = data.data;
    }
  } catch (error) {
    console.error('获取分销中心数据失败:', error);
  }
};

const fetchOrders = async () => {
  try {
    const query = new URLSearchParams({
      page: currentPage.value,
      pageSize: 10
    });

    if (filterStatus.value) {
      query.append('settlementStatus', filterStatus.value);
    }

    const response = await fetch(`/api/distributor/orders?${query}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const data = await response.json();
    if (data.success) {
      orders.value = data.data.list;
      totalPage.value = data.data.totalPage;
    }
  } catch (error) {
    console.error('获取佣金明细失败:', error);
  }
};

const copyDistributorCode = () => {
  const code = centerData.value.distributorCode;
  const url = `${window.location.origin}?distributor=${code}`;
  navigator.clipboard.writeText(url).then(() => {
    alert('推广链接已复制');
  }).catch(() => {
    alert('复制失败');
  });
};

onMounted(() => {
  fetchDistributorInfo();
});
</script>

<style scoped>
.distribution-center {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  margin-bottom: 30px;
  text-align: center;
}

.header h1 {
  font-size: 32px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.header .subtitle {
  font-size: 16px;
  color: #666;
}

.apply-section {
  margin-bottom: 40px;
}

.apply-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 60px 40px;
  text-align: center;
  color: white;
}

.apply-card h2 {
  font-size: 28px;
  margin-bottom: 15px;
}

.apply-card p {
  font-size: 16px;
  margin-bottom: 30px;
  opacity: 0.9;
}

.apply-btn {
  display: inline-block;
  padding: 12px 40px;
  background: white;
  color: #667eea;
  border-radius: 6px;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.3s;
}

.apply-btn:hover {
  transform: scale(1.05);
}

.distributor-info {
  margin-bottom: 30px;
}

.info-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-card h3 {
  font-size: 16px;
  color: #666;
  margin-bottom: 10px;
}

.status {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
}

.status-0 {
  color: #ff9800;
}

.status-1 {
  color: #4caf50;
}

.status-2 {
  color: #f44336;
}

.distributor-code {
  font-size: 14px;
  color: #666;
  margin-top: 10px;
}

.distributor-code strong {
  color: #333;
  font-family: monospace;
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
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 32px;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-bottom: 40px;
}

.btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
  transition: all 0.3s;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.orders-section {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.orders-section h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

.filter-bar {
  margin-bottom: 20px;
}

.filter-bar select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.order-item {
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 15px;
  transition: background 0.3s;
}

.order-item:hover {
  background: #f9f9f9;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.product-info {
  display: flex;
  gap: 12px;
  flex: 1;
}

.product-pic {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  object-fit: cover;
}

.product-details {
  flex: 1;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
}

.order-sn {
  font-size: 12px;
  color: #999;
}

.order-amount {
  text-align: right;
}

.commission {
  font-size: 18px;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 5px;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
  padding-top: 10px;
  border-top: 1px solid #eee;
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

