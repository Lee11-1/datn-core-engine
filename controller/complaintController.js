const complaintService = require('../service/complaintService');

class ComplaintController {
  async createComplaint(ctx) {
    try {
      const complaintData = ctx.request.body;
      const newComplaint = await complaintService.createComplaint(complaintData);

      ctx.status = 201;
      ctx.body = {
        success: true,
        message: 'Complaint created successfully',
        data: newComplaint,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async getComplaints(ctx) {
    try {
      const result = await complaintService.getComplaints(ctx.query);

      ctx.body = {
        success: true,
        data: result.complaints,
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

  async updateComplaint(ctx) {
    try {
      const { id } = ctx.params;
      const updateData = ctx.request.body;
      const updatedComplaint = await complaintService.updateComplaint(id, updateData);

      ctx.body = {
        success: true,
        message: 'Complaint updated successfully',
        data: updatedComplaint,
      };
    } catch (error) {
      if (error.message === 'Complaint not found') {
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

  async updateComplaintStatus(ctx) {
    try {
      const { id, status } = ctx.request.body;

      if (!id || !status) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: 'Missing id or status in request body',
        };
        return;
      }
      console.log('Updating complaint status:', { id, status });
      const result = await complaintService.updateComplaintStatus(id, status);
        ctx.body = {
          success: true,
          message: 'Complaint status updated successfully',
          data: result,
        };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async deleteComplaint(ctx) {
    try {
      const { id } = ctx.params;
      await complaintService.deleteComplaint(id);

      ctx.body = {
        success: true,
        message: 'Complaint deleted successfully',
      };
    } catch (error) {
      if (error.message === 'Complaint not found') {
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

  async getComplaintsByUser(ctx) {
    try {
      const { userId } = ctx.params;
      const { limit = 50, offset = 0 } = ctx.query;

      const result = await complaintService.getComplaintsByUser(
        userId,
        parseInt(limit),
        parseInt(offset)
      );

      ctx.body = {
        success: true,
        data: result.complaints,
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
  
    async getComplaintsByCustomer(ctx) {
        try{
            const { customerId } = ctx.params;
            const { limit = 50, offset = 0 } = ctx.query;

       const result = await complaintService.getComplaintsByCustomer(
            customerId,
            parseInt(limit),
            parseInt(offset)
        );

        ctx.body = {
            success: true,
            data: result.complaints,
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

     async getComplaintsByOrder(ctx) {
        try{
            const { orderId } = ctx.params;
            const { limit = 50, offset = 0 } = ctx.query;

       const result = await complaintService.getComplaintsByOrder(
            orderId,
            parseInt(limit),
            parseInt(offset)
        );

        ctx.body = {
            success: true,
            data: result.complaints,
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
}

module.exports = new ComplaintController();
