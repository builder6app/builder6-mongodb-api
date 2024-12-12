import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { default as axios } from 'axios';
import { Microsoft365Service } from './microsoft365.service';

@Controller('microsoft365')
export class Microsoft365Controller {
  constructor(
    private microsoft365Service: Microsoft365Service,
  ) {}

  @Get('onedrive')
  async getUserOneDriveInfo() {

    const userPrincipalName = process.env.MICROSOFT365_USERNAME;
    try {

      const accessToken = await this.microsoft365Service.getAccessToken();

      const driveResponse = await axios.get(
        `https://graph.microsoft.com/v1.0/users/${userPrincipalName}/drive`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      return driveResponse.data;
    } catch (error) {
      const message = error.response ? error.response.data : error.message;
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('sites')
  async getSites() {

    try {

      const accessToken = await this.microsoft365Service.getAccessToken();

      const driveResponse = await axios.get(
        `https://graph.microsoft.com/v1.0/sites`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      return driveResponse.data;
    } catch (error) {
      const message = error.response ? error.response.data : error.message;
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}