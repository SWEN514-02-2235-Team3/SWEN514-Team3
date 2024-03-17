
/*
********************************************
    1. VPC Configuration

        Heiarchy:
            VPC
                InternetGateway
                Subnets
                    Public
                    Private
                Route Tables
                    Public
                    Private
                Network Connections

**********************************************
*/

// Primary VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/24"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = {
    Name = "my-cf-vpc"
  }
}

// Internet Gateway
resource "aws_internet_gateway" "internet_gateway" {
  vpc_id = aws_vpc.main.id
  tags = {
    Name = "my-cf-internet-gateway"
  }
}

/*
******************
  PUBLIC Subnets
******************
*/
resource "aws_subnet" "public_a" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.0.0/26"
  map_public_ip_on_launch = true
  availability_zone       = data.aws_availability_zones.available.names[0]
  tags = {
    Name = "my-cf-subnet-public-1"
  }
}

resource "aws_subnet" "public_b" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.0.64/26"
  map_public_ip_on_launch = true
  availability_zone       = data.aws_availability_zones.available.names[0]
  tags = {
    Name = "my-cf-subnet-public-2"
  }
}

/*
******************
  ROUTE TABLES
******************
*/

// Public Route Table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  tags = {
    Name = "my-cf-routetable-public"
  }
}

// Public Route
resource "aws_route" "public" {
  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.internet_gateway.id
}



/*
******************
  SUBNET ASSOCIATIONS
******************
*/

// Public
resource "aws_route_table_association" "public_a" {
  subnet_id      = aws_subnet.public_a.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_b" {
  subnet_id      = aws_subnet.public_b.id
  route_table_id = aws_route_table.public.id
}