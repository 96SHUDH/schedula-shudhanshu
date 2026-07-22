import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('patient')
export class PatientController {
  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PATIENT')
  getProfile(@Req() req) {
    return {
      message: 'Patient Profile',
      user: req.user,
    };
  }
}