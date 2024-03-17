/*
********************************************
    2. AWS EC2 configuration. Contains:
        - EC2
          - Security Group
          
**********************************************
*/

// AWS EC2
resource "aws_instance" "ec2" {
  instance_type          = var.instance_type
  key_name               = var.key_name
  subnet_id              = aws_subnet.public_a.id
  vpc_security_group_ids = [aws_security_group.instance.id]
  ami                    = data.aws_ami.selected.id
}

// Security Group
resource "aws_security_group" "instance" {
  vpc_id = aws_vpc.main.id
  name   = "instance_sg"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ssh_location]
  }
}