output "instance_ip_addr" {
  value = aws_instance.ec2[*].private_ip
}

output "instance_ip_addr_public" {
  value = aws_instance.ec2[*].public_ip
}