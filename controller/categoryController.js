const categoryService = require('../service/categoryService');

class CategoryController {
  async createCategory(ctx) {
    try {
      const categoryData = ctx.request.body;
      const newCategory = await categoryService.createCategory(categoryData);

      ctx.status = 201;
      ctx.body = {
        success: true,
        message: 'Category created successfully',
        data: newCategory,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async getCategories(ctx) {
    try {
      const result = await categoryService.getCategories(ctx.query);

      ctx.body = {
        success: true,
        data: result.categories,
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

  async getCategoryById(ctx) {
    try {
      const { id } = ctx.params;
      const category = await categoryService.getCategoryById(id);

      ctx.body = {
        success: true,
        data: category,
      };
    } catch (error) {
      if (error.message === 'Category not found') {
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

  async updateCategory(ctx) {
    try {
      const { id } = ctx.params;
      const updateData = ctx.request.body;
      const updatedCategory = await categoryService.updateCategory(id, updateData);

      ctx.body = {
        success: true,
        message: 'Category updated successfully',
        data: updatedCategory,
      };
    } catch (error) {
      if (error.message === 'Category not found') {
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

  async deleteCategory(ctx) {
    try {
      const { id } = ctx.params;
      await categoryService.deleteCategory(id);

      ctx.body = {
        success: true,
        message: 'Category deleted successfully',
      };
    } catch (error) {
      if (error.message === 'Category not found') {
        ctx.status = 404;
      } else if (error.message.includes('Cannot delete')) {
        ctx.status = 400;
      } else {
        ctx.status = 500;
      }
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async getCategoryTree(ctx) {
    try {
      const tree = await categoryService.getCategoryTree();

      ctx.body = {
        success: true,
        data: tree,
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async getRootCategories(ctx) {
    try {
      const categories = await categoryService.getRootCategories();

      ctx.body = {
        success: true,
        data: categories,
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async getChildCategories(ctx) {
    try {
      const { parentId } = ctx.params;
      const categories = await categoryService.getChildCategories(parentId);

      ctx.body = {
        success: true,
        data: categories,
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async activateCategory(ctx) {
    try {
      const { id } = ctx.params;
      const category = await categoryService.activateCategory(id);

      ctx.body = {
        success: true,
        message: 'Category activated successfully',
        data: category,
      };
    } catch (error) {
      if (error.message === 'Category not found') {
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

  async deactivateCategory(ctx) {
    try {
      const { id } = ctx.params;
      const category = await categoryService.deactivateCategory(id);

      ctx.body = {
        success: true,
        message: 'Category deactivated successfully',
        data: category,
      };
    } catch (error) {
      if (error.message === 'Category not found') {
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

  async reorderCategories(ctx) {
    try {
      const { id } = ctx.params;
      const { sortOrder } = ctx.request.body;

      if (sortOrder === undefined) {
        throw new Error('sortOrder is required');
      }

      const category = await categoryService.reorderCategories(id, sortOrder);

      ctx.body = {
        success: true,
        message: 'Category reordered successfully',
        data: category,
      };
    } catch (error) {
      if (error.message === 'Category not found') {
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
}

module.exports = new CategoryController();
