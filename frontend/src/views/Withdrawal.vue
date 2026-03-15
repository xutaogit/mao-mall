<template>
  <div class="withdrawal-container">
    <div class="header">
      <h1>佣金提现</h1>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">累计佣金</div>
        <div class="stat-value">¥{{ stats.totalCommission.toFixed(2) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">待结算</div>
        <div class="stat-value">¥{{ stats.pendingSettlement.toFixed(2) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">可提现</div>
        <div class="stat-value highlight">¥{{ stats.availableWithdrawal.toFixed(2) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">已提现</div>
        <div class="stat-value">¥{{ stats.withdrawnAmount.toFixed(2) }}</div>
      </div>
    </div>

    <!-- 提现申请表单 -->
    <div class="form-section">
      <h2>申请提现</h2>
      <form @submit.prevent="submitWithdrawal">
        <div class="form-group">
          <label>提现金额 (¥)</label>
          <input
            v-model.number="form.amount"
            type="number"
            placeholder="请输入提现金额"
            step="0.01"
            min="0"
            :max="stats.availableWithdrawal"
            required
          />
          <small>最多可提现 ¥{{ stats.availableWithdrawal.toFixed(2) }}</small>
        </div>

        <div class="form-group">
          <label>收款人姓名</label>
          <input
            v-model="form.accountHolder"
            type="text"
            placeholder="请输入收款人姓名"
            required
          />
        </div>

        <div class="form-group">
          <label>开户银行</label>
          <input
            v-model="form.bankName"
            type="text"
            placeholder="如：中国工商银行"
            required
          />
        </div>

        <div class="form-group">
          <label>银行卡号</label>
          <input
            v-model="form.bankAccount"
            type="text"
            placeholder="请输入银行卡号"
            required
          />
        </div>

        <button type="submit" class="submit-btn" :disabled="loading || stats.availableWithdrawal <= 0">
          {{ loading ? '提交中...' : '提交申请' }}
        </button>
      </form>
    </div>

    <!-- 提现记录 -->
    <div class="records-section">
      <h2>提现记录</h2>
      <div v-if="records.length === 0" class="empty-state">
        <p>暂无提现记录</p>
      </div>
      <div v-else class="records-list">
        <div v-for="record in records" :key="record._id" class="record-item">
          <div class="record-header">
            <span class="amount">¥{{ record.amount.toFixed(2) }}</span>
            <span :class="['status', `status-${record.status}`]">
              {{ getStatusText(record.status) }}
            </span>
          </div>
          <div class="record-details">
            <p>{{ record.accountHolder }} - {{ record.bankName }}</p>
            <p class="time">{{ formatDate(record.applyTime) }}</p>
          </div>
          <div v-if="record.failReason" class="fail-reason">
            拒绝原因：{{ record.failReason }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const loading = ref(false);

const stats = ref({
  totalCommission: 0,
  pendingSettlement: 0,
  availableWithdrawal: 0,
  withdrawnAmount: 0
});

const form = ref({
  amount: '',
  accountHolder: '',
  bankName: '',
  bankAccount: ''
});

const records = ref([]);

const getStatusText = (status) => {
  const statusMap = {
    0: '待审核',
    1: '已批准',
    2: '已拒绝',
    3: '已完成'
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

const fetchSummary = async () => {
  try {
    const response = await fetch('/api/withdrawal/summary', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const data = await response.json();
    if (data.success) {
      stats.value = data.data;
    }
  } catch (error) {
    console.error('获取统计信息失败:', error);
  }
};

const fetchRecords = async () => {
  try {
    const response = await fetch('/api/withdrawal/records', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const data = await response.json();
    if (data.success) {
      records.value = data.data.list;
    }
  } catch (error) {
    console.error('获取提现记录失败:', error);
  }
};

const submitWithdrawal = async () => {
  if (!form.value.amount || form.value.amount <= 0) {
    alert('请输入有效的提现金额');
    return;
  }

  if (form.value.amount > stats.value.availableWithdrawal) {
    alert('提现金额不能超过可提现金额');
    return;
  }

  loading.value = true;
  try {
    const response = await fetch('/api/withdrawal/apply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(form.value)
    });

    const data = await response.json();
    if (data.success) {
      alert(data.message);
      form.value = {
        amount: '',
        accountHolder: '',
        bankName: '',
        bankAccount: ''
      };
      await fetchSummary();
      await fetchRecords();
    } else {
      alert(data.message);
    }
  } catch (error) {
    alert('提交失败，请重试');
    console.error('提交失败:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchSummary();
  fetchRecords();
});
</script>

<style scoped>
.withdrawal-container {
  max-width: 1200px;
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
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #333;
}

.stat-value.highlight {
  color: #ff6b6b;
}

.form-section {
  background: white;
  border-radius: 8px;
  padding: 30px;
  margin-bottom: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-section h2 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #ff6b6b;
}

.form-group small {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  color: #999;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.submit-btn:hover:not(:disabled) {
  background: #ff5252;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.records-section {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.records-section h2 {
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

.records-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.record-item {
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 15px;
  transition: background 0.3s;
}

.record-item:hover {
  background: #f9f9f9;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.record-header .amount {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-0 {
  background: #fff3cd;
  color: #856404;
}

.status-1 {
  background: #d1ecf1;
  color: #0c5460;
}

.status-2 {
  background: #f8d7da;
  color: #721c24;
}

.status-3 {
  background: #d4edda;
  color: #155724;
}

.record-details {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.record-details p {
  margin: 5px 0;
}

.record-details .time {
  font-size: 12px;
  color: #999;
}

.fail-reason {
  margin-top: 10px;
  padding: 10px;
  background: #fff3cd;
  border-left: 3px solid #ffc107;
  font-size: 12px;
  color: #856404;
}
</style>

