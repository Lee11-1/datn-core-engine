const customerService = require('../service/customerService');

class CustomerController {
  async createCustomer(ctx) {
    try {
      const customerData = ctx.request.body;
      const newCustomer = await customerService.createCustomer(customerData);

      ctx.status = 201;
      ctx.body = {
        success: true,
        message: 'Customer created successfully',
        data: newCustomer,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async getCustomers(ctx) {
    try {
      const result = await customerService.getCustomers(ctx.query);

      ctx.body = {
        success: true,
        data: result.customers,
        pagination: result.pagination,
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async getCustomerById(ctx) {
    try {
      const { id } = ctx.params;
      const customer = await customerService.getCustomerById(id);

      ctx.body = {
        success: true,
        data: customer,
      };
    } catch (error) {
      if (error.message === 'Customer not found') {
        ctx.status = 404;
      } else {
        ctx.status = 500;
      }
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async updateCustomer(ctx) {
    try {
      const { id } = ctx.params;
      const updateData = ctx.request.body;
      const updatedCustomer = await customerService.updateCustomer(id, updateData);

      ctx.body = {
        success: true,
        message: 'Customer updated successfully',
        data: updatedCustomer,
      };
    } catch (error) {
      if (error.message === 'Customer not found') {
        ctx.status = 404;
      } else {
        ctx.status = 400;
      }
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async deleteCustomer(ctx) {
    try {
      const { id } = ctx.params;
      await customerService.deleteCustomer(id);

      ctx.body = {
        success: true,
        message: 'Customer deleted successfully',
      };
    } catch (error) {
      if (error.message === 'Customer not found') {
        ctx.status = 404;
      } else {
        ctx.status = 500;
      }
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async searchCustomers(ctx) {
    try {
      const { keyword, limit = 20 } = ctx.query;

      if (!keyword || keyword.trim() === '') {
        throw new Error('Search keyword is required');
      }

      const customers = await customerService.searchCustomers(keyword, parseInt(limit));

      ctx.body = {
        success: true,
        data: customers,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async getCustomersByZone(ctx) {
    try {
      const { zoneId } = ctx.params;
      const { limit = 50, offset = 0 } = ctx.query;

      const result = await customerService.getCustomersByZone(
        zoneId,
        parseInt(limit),
        parseInt(offset)
      );

      ctx.body = {
        success: true,
        data: result.customers,
        total: result.total,
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async getCustomersByUser(ctx) {
    try {
      const { userId } = ctx.params;
      const { limit = 50, offset = 0 } = ctx.query;

      const result = await customerService.getCustomersByUser(
        userId,
        parseInt(limit),
        parseInt(offset)
      );

      ctx.body = {
        success: true,
        data: result.customers,
        total: result.total,
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async getCustomerByPhone(ctx) {
    try {
      const { phone } = ctx.query;

      if (!phone || phone.trim() === '') {
        throw new Error('Phone number is required');
      }

      const customer = await customerService.getCustomerByPhone(phone);

      if (!customer) {
        ctx.status = 404;
        ctx.body = {
          success: false,
          message: 'Customer not found',
        };
        return;
      }

      ctx.body = {
        success: true,
        data: customer,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async getCustomerByEmail(ctx) {
    try {
      const { email } = ctx.query;

      if (!email || email.trim() === '') {
        throw new Error('Email is required');
      }

      const customer = await customerService.getCustomerByEmail(email);

      if (!customer) {
        ctx.status = 404;
        ctx.body = {
          success: false,
          message: 'Customer not found',
        };
        return;
      }

      ctx.body = {
        success: true,
        data: customer,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }
}

module.exports = new CustomerController();
